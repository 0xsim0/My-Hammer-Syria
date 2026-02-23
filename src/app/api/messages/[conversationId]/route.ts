import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { safeTrigger, PUSHER_EVENTS, getConversationChannel, getUserChannel } from "@/lib/pusher";

type RouteParams = { params: Promise<{ conversationId: string }> };

const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
});

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        job: {
          select: { id: true, title: true, titleAr: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, nameAr: true, image: true },
            },
          },
        },
        messages: {
          include: {
            sender: {
              select: { id: true, name: true, image: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Verify the user is a participant
    const isParticipant = conversation.participants.some(
      (p) => p.userId === session.user.id
    );
    if (!isParticipant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find the other user
    const otherParticipant = conversation.participants.find(
      (p) => p.userId !== session.user.id
    );

    const result = {
      id: conversation.id,
      otherUser: otherParticipant
        ? {
            id: otherParticipant.user.id,
            name: otherParticipant.user.name,
            image: otherParticipant.user.image,
          }
        : { id: "", name: "Unknown", image: null },
      job: conversation.job
        ? { id: conversation.job.id, title: conversation.job.title }
        : null,
      messages: [...conversation.messages].reverse().map((msg) => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.senderId,
        createdAt: msg.createdAt.toISOString(),
        sender: msg.sender,
      })),
    };

    return NextResponse.json(result);
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;

    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id,
        },
      },
    });

    if (!participant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = sendMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.user.id,
        content: parsed.data.content,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    await safeTrigger(
      getConversationChannel(conversationId),
      PUSHER_EVENTS.NEW_MESSAGE,
      message
    );

    const otherParticipants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId,
        userId: { not: session.user.id },
      },
    });

    if (otherParticipants.length > 0) {
      await prisma.notification.createMany({
        data: otherParticipants.map((p) => ({
          userId: p.userId,
          type: "NEW_MESSAGE",
          titleEn: "New message",
          titleAr: "رسالة جديدة",
          link: `/messages/${conversationId}`,
        })),
      });

      await Promise.all(
        otherParticipants.map((p) =>
          safeTrigger(
            getUserChannel(p.userId),
            PUSHER_EVENTS.NEW_NOTIFICATION,
            { type: "NEW_MESSAGE", conversationId }
          )
        )
      );
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
