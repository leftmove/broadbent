"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { ChatMessage } from "components/chat-message";
import { ChatInput } from "components/chat-input";
import { useEffect, useRef, useMemo } from "react";

interface ChatWindowProps {
  chatId: Id<"chats"> | null;
}

export function ChatWindow({ chatId }: ChatWindowProps) {
  const messagesQuery = useQuery(
    api.messages.list,
    chatId ? { chatId } : "skip"
  );
  const messages = useMemo(() => messagesQuery || [], [messagesQuery]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!chatId) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="text-center text-muted-foreground">
          <h2 className="mb-2 text-2xl font-semibold">Welcome to Broadbent</h2>
          <p>Select a chat or create a new one to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <ChatMessage key={message._id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput chatId={chatId} />
    </div>
  );
}
