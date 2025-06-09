"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "components/ui/scroll-area";
import { MessageBubble } from "components/chat/message-bubble";
import { TypingIndicator } from "components/chat/typing-indicator";
import type { Message } from "state/functionality/messages";

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
}

export function MessageList({ messages, isTyping }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message._id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
      </div>
    </ScrollArea>
  );
}
