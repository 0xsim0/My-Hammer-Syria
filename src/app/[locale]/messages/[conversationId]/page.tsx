"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Avatar, Button, Skeleton } from "@/components/ui";
import { ArrowLeft, Send } from "lucide-react";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
}

interface ConversationData {
  id: string;
  otherUser: {
    id: string;
    name: string;
    image?: string | null;
  };
  job?: { id: string; title: string } | null;
  messages: Message[];
}

export default function ChatPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const t = useTranslations("chat");
  const [conv, setConv] = useState<ConversationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [convId, setConvId] = useState<string>("");

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    params.then((p) => {
      setConvId(p.conversationId);
      fetchConversation(p.conversationId);
    });
  }, [params]);

  useEffect(() => {
    scrollToBottom();
  }, [conv?.messages, scrollToBottom]);

  async function fetchConversation(id: string) {
    try {
      const [convRes, sessionRes] = await Promise.all([
        fetch(`/api/conversations/${id}`),
        fetch("/api/auth/session"),
      ]);
      if (convRes.ok) {
        const data = await convRes.json();
        setConv(data);
      }
      if (sessionRes.ok) {
        const session = await sessionRes.json();
        setCurrentUserId(session?.user?.id || "");
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || !convId) return;

    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message }),
      });

      if (res.ok) {
        const newMsg = await res.json();
        setConv((prev) =>
          prev
            ? { ...prev, messages: [...prev.messages, newMsg] }
            : prev
        );
        setMessage("");
      }
    } catch {
      // handle error
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton variant="text" className="mb-4 h-12 w-full" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="text"
              className={`h-10 ${i % 2 === 0 ? "w-2/3" : "w-1/2 self-end"}`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!conv) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-gray-500">Conversation not found</p>
        <Button asChild variant="outline">
          <Link href="/messages">{t("title")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-2xl flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
        <Link
          href="/messages"
          className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 touch-manipulation"
          aria-label={t("title")}
        >
          <ArrowLeft className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
        </Link>
        <Avatar
          name={conv.otherUser.name}
          src={conv.otherUser.image}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-900 truncate">
            {conv.otherUser.name}
          </p>
          {conv.job && (
            <Link
              href={`/jobs/${conv.job.id}`}
              className="text-xs text-primary-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:rounded-sm"
            >
              {conv.job.title}
            </Link>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-3">
          {conv.messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    isMe
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p
                    className={`mt-1 text-xs ${
                      isMe ? "text-primary-200" : "text-gray-400"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-gray-200 px-4 py-3"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("typeMessage")}
          className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label={t("typeMessage")}
        />
        <button
          type="submit"
          disabled={!message.trim() || sending}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 touch-manipulation"
          aria-label={t("send")}
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
