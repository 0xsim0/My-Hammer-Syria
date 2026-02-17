"use client";

import { useEffect, useState, useCallback } from "react";
import { getPusherClient, getConversationChannel, PUSHER_EVENTS } from "@/lib/pusher";

export interface Message {
  id: string;
  content: string;
  imageUrl?: string | null;
  senderId: string;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export function useRealTimeChat(conversationId: string, userId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/messages/${conversationId}`);
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      setMessages(data.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  // Subscribe to real-time updates
  useEffect(() => {
    fetchMessages();

    const pusher = getPusherClient();
    const channel = pusher.subscribe(getConversationChannel(conversationId));

    channel.bind(PUSHER_EVENTS.NEW_MESSAGE, (newMessage: Message) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(getConversationChannel(conversationId));
    };
  }, [conversationId, fetchMessages]);

  // Send message
  const sendMessage = useCallback(
    async (content: string, imageUrl?: string) => {
      if (!content.trim() && !imageUrl) return;
      setIsSending(true);
      try {
        const res = await fetch(`/api/messages/${conversationId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, imageUrl }),
        });
        if (!res.ok) throw new Error("Failed to send message");
        // Message will come back via Pusher
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send");
        throw err;
      } finally {
        setIsSending(false);
      }
    },
    [conversationId]
  );

  return { messages, isLoading, isSending, error, sendMessage, refetch: fetchMessages };
}
