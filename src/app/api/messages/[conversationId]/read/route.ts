import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type RouteParams = { params: Promise<{ conversationId: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;

    // Verify user is a participant
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId: session.user.id },
    });

    if (!participant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Mark all messages in this conversation as read for this user
    await prisma.$transaction([
      prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: session.user.id },
          isRead: false,
        },
        data: { isRead: true },
      }),
      prisma.conversationParticipant.update({
        where: { id: participant.id },
        data: { lastReadAt: new Date() },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
