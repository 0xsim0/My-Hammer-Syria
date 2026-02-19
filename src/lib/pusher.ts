import Pusher from "pusher";
import PusherClient from "pusher-js";

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: process.env.PUSHER_APP_CLUSTER ?? "eu",
  useTLS: true,
});

// Client-side Pusher instance (singleton)
let pusherClientInstance: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER ?? "eu",
        authEndpoint: "/api/pusher/auth",
      }
    );
  }
  return pusherClientInstance;
}

export const PUSHER_EVENTS = {
  NEW_MESSAGE: "new-message",
  NEW_NOTIFICATION: "new-notification",
  BID_UPDATE: "bid-update",
  JOB_UPDATE: "job-update",
} as const;

export function getConversationChannel(conversationId: string) {
  return `private-conversation-${conversationId}`;
}

export function getUserChannel(userId: string) {
  return `private-user-${userId}`;
}

// Safe trigger: silently ignores errors when Pusher is not configured
export async function safeTrigger(
  channel: string,
  event: string,
  data: object
): Promise<void> {
  const key = process.env.PUSHER_APP_KEY;
  if (!key || key === "your-pusher-key") return;
  try {
    await pusherServer.trigger(channel, event, data);
  } catch {
    // Pusher not reachable — non-critical, skip silently
  }
}
