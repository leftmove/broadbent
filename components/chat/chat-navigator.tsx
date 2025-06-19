"use client";

import { useState } from "react";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

import { List, User, Bot, ChevronRight, Hash } from "lucide-react";

import { cn } from "lib/utils";

export function ChatNavigator({ chatSlug }: { chatSlug: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const chat = useQuery(api.chats.getBySlug, { slug: chatSlug });
  const messages = useQuery(
    api.messages.listBySlug,
    chat ? { chatSlug } : "skip"
  );

  if (!chat || !messages) {
    return null;
  }

  // Filter out system messages and error messages for the TOC
  const relevantMessages = messages.filter(
    (msg) => msg.role !== "system" && msg.type !== "error"
  );

  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsOpen(false);
    }, 500);
    setHoverTimeout(timeout);
  };

  const scrollToMessage = (messageId: string) => {
    // Try multiple possible selectors for the message
    let element = document.getElementById(messageId);
    if (!element) {
      element = document.querySelector(`[data-message-id="${messageId}"]`);
    }
    if (!element) {
      // Try finding by message content or other attributes
      element = document.querySelector(`div[data-id="${messageId}"]`);
    }

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setIsOpen(false), 500);
    } else {
      console.warn(`Message element with ID ${messageId} not found`);
      setIsOpen(false);
    }
  };

  const formatMessagePreview = (content: string, maxLength: number = 80) => {
    const cleanContent = content.replace(/\n+/g, " ").trim();
    if (cleanContent.length <= maxLength) return cleanContent;
    return cleanContent.substring(0, maxLength) + "...";
  };

  return (
    <div className="fixed top-4 right-6 z-40">
      <div
        className={cn(
          "flex overflow-hidden flex-col rounded-2xl border backdrop-blur-md transition-all duration-300 ease-out",
          isOpen
            ? "w-96 h-auto bg-background/95 border-border/50 max-h-[70vh]"
            : "w-12 h-12 bg-background/70 border-border/40 hover:bg-background/80 hover:scale-105"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transformOrigin: "top right",
        }}
      >
        {/* Header */}
        <div
          className={cn(
            "flex justify-between items-center transition-all duration-300",
            isOpen ? "p-4 pb-2" : "p-3"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-2 cursor-pointer transition-all duration-300 hover:text-foreground",
              !isOpen && "justify-center w-full h-full"
            )}
            onClick={() => setIsOpen(!isOpen)}
          >
            <List className="flex-shrink-0 w-5 h-5 text-foreground/70" />
            <span
              className={cn(
                "overflow-hidden text-sm font-medium transition-all duration-300 text-foreground",
                isOpen ? "opacity-100 max-w-40" : "max-w-0 opacity-0"
              )}
            >
              Navigator
            </span>
          </div>
          <div
            className={cn(
              "flex overflow-hidden gap-1 items-center px-2 py-1 text-xs rounded-md transition-all duration-300 bg-muted text-muted-foreground",
              isOpen ? "opacity-100 max-w-20" : "max-w-0 opacity-0"
            )}
          >
            <Hash className="flex-shrink-0 w-3 h-3" />
            <span className="whitespace-nowrap">{relevantMessages.length}</span>
          </div>
        </div>

        {/* Content */}
        <div
          className={cn(
            "overflow-hidden flex-1 transition-all duration-300",
            isOpen ? "opacity-100 max-h-[70vh]" : "max-h-0 opacity-0"
          )}
        >
          <div className="px-3 pb-2">
            <div className="text-xs whitespace-nowrap text-muted-foreground">
              {chat.title}
            </div>
          </div>

          <div className="overflow-y-auto px-2 pb-3 max-h-[calc(70vh-6rem)]">
            <div className="space-y-1">
              {relevantMessages.map((message, index) => {
                const isUser = message.role === "user";
                const messageNumber = index + 1;

                return (
                  <div
                    key={message._id}
                    className={cn(
                      "flex gap-2 items-start p-2 rounded-lg border border-transparent transition-all duration-200 cursor-pointer group",
                      "hover:bg-muted/50 hover:border-border/30"
                    )}
                    onClick={() => scrollToMessage(message._id)}
                  >
                    {/* Message Number */}
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-medium flex-shrink-0 mt-0.5">
                      {messageNumber}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm leading-relaxed text-foreground/80">
                        {formatMessagePreview(message.content)}
                      </div>
                      <div className="flex gap-2 items-center mt-1">
                        {message.thinking && (
                          <div
                            className="w-1.5 h-1.5 rounded-full bg-purple-500"
                            title="Has reasoning"
                          />
                        )}
                        {message.sources && message.sources.length > 0 && (
                          <div
                            className="w-1.5 h-1.5 rounded-full bg-blue-500"
                            title="Has sources"
                          />
                        )}
                      </div>
                    </div>

                    {/* Role Icon */}
                    <div className="flex flex-shrink-0 items-center">
                      {isUser ? (
                        <User className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Bot className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>

                    {/* Hover Arrow */}
                    <ChevronRight className="flex-shrink-0 w-4 h-4 opacity-0 transition-opacity duration-200 text-muted-foreground group-hover:opacity-100" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
