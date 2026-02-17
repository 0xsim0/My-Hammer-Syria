"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Send, ArrowDown, Image as ImageIcon } from "lucide-react";
import { cn } from "@/components/ui/cn";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { MessageBubble } from "./MessageBubble";
import { getPusherClient, getConversationChannel, PUSHER_EVENTS } from "@/lib/pusher";

interface Message {
  id: string;
  content: string;
  imageUrl?: string | null;
  senderId: string;
  isRead: boolean;
  createdAt: string | Date;
}

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  initialMessages?: Message[];
  className?: string;
}

export function ChatWindow({
  conversationId,
  currentUserId,
  initialMessages = [],
  className,
}: ChatWindowProps) {
  const t = useTranslations("chat");

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // Scroll detection
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const handleScroll = () => {
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollBtn(distFromBottom > 100);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // Pusher subscription
  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(getConversationChannel(conversationId));

    channel.bind(PUSHER_EVENTS.NEW_MESSAGE, (newMessage: Message) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(getConversationChannel(conversationId));
    };
  }, [conversationId]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    setSending(true);
    setInput("");

    try {
      await fetch(`/api/messages/${conversationId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) return;
      const { url } = await uploadRes.json();

      await fetch(`/api/messages/${conversationId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "", imageUrl: url }),
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Messages list */}
      <div ref={listRef} className="relative flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-2">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              content={msg.content}
              timestamp={msg.createdAt}
              isOwn={msg.senderId === currentUserId}
              isRead={msg.isRead}
              imageUrl={msg.imageUrl}
            />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Scroll to bottom button */}
        {showScrollBtn && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="absolute bottom-4 end-4 rounded-full bg-white p-2 shadow-md hover:bg-gray-50"
            aria-label="Scroll to bottom"
          >
            <ArrowDown size={18} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <label className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100">
            <ImageIcon size={20} aria-hidden="true" />
            <span className="sr-only">Upload image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="sr-only"
              disabled={sending}
            />
          </label>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("typeMessage")}
            className={cn(
              "flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm",
              "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 focus-visible:outline-none"
            )}
            disabled={sending}
          />

          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() && !sending}
            isLoading={sending}
            aria-label={t("send")}
          >
            {!sending && <Send size={18} aria-hidden="true" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
