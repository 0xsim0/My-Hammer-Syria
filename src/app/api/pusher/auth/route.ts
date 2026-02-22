import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.text();
    const params = new URLSearchParams(body);
    const socketId = params.get("socket_id");
    const channelName = params.get("channel_name");

    if (!socketId || !channelName) {
      return NextResponse.json(
        { error: "Missing socket_id or channel_name" },
        { status: 400 }
      );
    }

    // Verify channel ownership before authenticating
    if (channelName.startsWith("private-user-")) {
      const channelUserId = channelName.replace("private-user-", "");
      if (channelUserId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (channelName.startsWith("private-conversation-")) {
      const conversationId = channelName.replace("private-conversation-", "");
      const participant = await prisma.conversationParticipant.findFirst({
        where: { conversationId, userId: session.user.id },
      });
      if (!participant) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const authResponse = pusherServer.authorizeChannel(socketId, channelName);

    return NextResponse.json(authResponse);
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
