"use client";

import { useState } from "react";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

import { Menu, MessageCircle } from "lucide-react";

import { cn } from "lib/utils";

export function ChatNavigator({ chatSlug }: { chatSlug: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const chat = useQuery(api.chats.getBySlug, { slug: chatSlug });
  const messages = useQuery(
    api.messages.list,
    chat ? { chatId: chat._id } : "skip"
  );

  if (!chat || !messages) {
    return null;
  }

  const userMessages = messages.filter(msg => msg.author === "user");

  const scrollToMessage = (messageId: string) => {
    const element = document.getElementById(messageId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div
      className={cn(
        "flex absolute top-6 right-6 z-40 flex-col items-center p-2 rounded-lg border drop-shadow-sm transition-all duration-300 border-border",
        isOpen
          ? "max-w-7xl opacity-100 bg-background/100 max-h-7xl"
          : "max-h-10 opacity-50 bg-background/50 max-w-10"
      )}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Menu
        className="z-50 w-10 h-10 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      />
      
      {isOpen && (
        <div className="mt-4 w-full max-w-md max-h-96 overflow-y-auto">
          <div className="text-sm font-medium text-muted-foreground mb-2 px-2">
            Messages ({userMessages.length})
          </div>
          <div className="space-y-1">
            {userMessages.map((message, index) => (
              <div
                key={message._id}
                className="flex items-start gap-2 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                onClick={() => scrollToMessage(message._id)}
              >
                <MessageCircle className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-muted-foreground mb-1">
                    Message {index + 1}
                  </div>
                  <div className="text-sm line-clamp-2 text-foreground">
                    {message.content.substring(0, 100)}
                    {message.content.length > 100 && "..."}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
