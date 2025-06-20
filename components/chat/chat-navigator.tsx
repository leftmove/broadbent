"use client";

import { useState, useRef } from "react";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

import { List, User, Bot, ChevronRight, Hash } from "lucide-react";

import { cn } from "lib/utils";
import { Keyboard } from "lib/keyboard";

export function ChatNavigator({ chatSlug }: { chatSlug: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const keyboardRef = useRef<Keyboard | null>(null);

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
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const scrollToMessage = (messageId: string) => {
    // Try multiple possible selectors for the message
    let element = document.getElementById(messageId);
    if (!element) {
      element = document.querySelector(`[data-message-id="${messageId}"]`);
    }
    if (!element) {
      element = document.querySelector(`div[data-id="${messageId}"]`);
    }

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      // Brief highlight effect
      element.style.boxShadow = '0 0 0 2px hsl(var(--primary))';
      element.style.borderRadius = '12px';
      setTimeout(() => {
        element!.style.boxShadow = '';
        element!.style.borderRadius = '';
      }, 2000);
      
      setIsOpen(false);
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

  // Initialize keyboard shortcuts
  if (!keyboardRef.current) {
    keyboardRef.current = new Keyboard().setup(["escape"], handleClose);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isOpen && keyboardRef.current) {
      keyboardRef.current.handler()(e as any);
    }
  };

  return (
    <div className="fixed top-4 right-6 z-[1000]">
      <div
        ref={containerRef}
        className={cn(
          "flex overflow-hidden flex-col border backdrop-blur-md transition-all duration-500 ease-out",
          isOpen
            ? "w-96 h-auto bg-card/95 border-border/60 max-h-[70vh] shadow-2xl rounded-2xl"
            : "w-12 h-12 bg-card/80 border-border/50 hover:bg-card/90 hover:scale-105 rounded-lg"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        tabIndex={isOpen ? 0 : -1}
        style={{
          transformOrigin: "top right",
        }}
      >
        {!isOpen ? (
          // Collapsed: Simple centered icon
          <div 
            className="absolute inset-0 flex items-center justify-center cursor-pointer group"
            onClick={() => setIsOpen(true)}
          >
            <List className="w-5 h-5 text-foreground/70 group-hover:text-foreground transition-colors duration-300" />
          </div>
        ) : (
          // Expanded: Full header
          <div className="p-4 pb-3">
            <div className="flex justify-between items-center">
              <div
                className="flex items-center gap-2 cursor-pointer transition-all duration-500 ease-out hover:text-foreground group"
                onClick={() => setIsOpen(false)}
              >
                <List className="flex-shrink-0 w-5 h-5 text-foreground/70 group-hover:text-foreground transition-colors duration-300" />
                <span className="text-sm font-semibold text-foreground font-sans">
                  Chat Navigator
                </span>
              </div>
              <div className="flex gap-1.5 items-center px-2.5 py-1.5 text-xs rounded-lg bg-secondary/50 text-secondary-foreground border border-border/30">
                <Hash className="flex-shrink-0 w-3 h-3" />
                <span className="whitespace-nowrap font-medium">{relevantMessages.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div
          className={cn(
            "overflow-hidden flex-1 transition-all duration-500 ease-out",
            isOpen ? "opacity-100 max-h-[70vh]" : "max-h-0 opacity-0"
          )}
        >
          <div className="px-4 pb-3">
            <div className="px-3 py-2 bg-muted/30 rounded-lg border border-border/20">
              <div className="text-xs font-medium text-muted-foreground/80 mb-1">
                Current Chat
              </div>
              <div className="text-sm font-semibold text-foreground truncate">
                {chat.title}
              </div>
            </div>
          </div>

          <div className="overflow-y-auto px-3 pb-4 max-h-[calc(70vh-8rem)] scrollbar-thin scrollbar-thumb-border/50 scrollbar-track-transparent">
            <div className="space-y-1.5">
              {relevantMessages.map((message, index) => {
                const isUser = message.role === "user";
                const messageNumber = index + 1;

                return (
                  <div
                    key={message._id}
                    className={cn(
                      "flex gap-3 items-start p-3 rounded-xl border border-transparent transition-all duration-300 cursor-pointer group hover:shadow-sm",
                      "hover:bg-secondary/30 hover:border-border/40 active:scale-[0.98]"
                    )}
                    onClick={() => scrollToMessage(message._id)}
                  >
                    {/* Message Number & Role Icon */}
                    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                      <div className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-lg text-xs font-semibold flex-shrink-0 transition-all duration-200 group-hover:scale-110",
                        isUser 
                          ? "bg-primary/10 text-primary border border-primary/20" 
                          : "bg-secondary text-secondary-foreground border border-border/30"
                      )}>
                        {messageNumber}
                      </div>
                      <div className={cn(
                        "p-1 rounded-md transition-all duration-200",
                        isUser ? "bg-primary/10" : "bg-secondary/50"
                      )}>
                        {isUser ? (
                          <User className="w-3 h-3 text-primary" />
                        ) : (
                          <Bot className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm leading-relaxed text-foreground/90 font-medium">
                        {formatMessagePreview(message.content, 90)}
                      </div>
                      <div className="flex gap-2 items-center mt-2">
                        {message.thinking && (
                          <div className="flex items-center gap-1">
                            <div
                              className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"
                              title="Has reasoning"
                            />
                            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Reasoning</span>
                          </div>
                        )}
                        {message.sources && message.sources.length > 0 && (
                          <div className="flex items-center gap-1">
                            <div
                              className="w-1.5 h-1.5 rounded-full bg-blue-500"
                              title="Has sources"
                            />
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{message.sources.length} sources</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Hover Arrow */}
                    <div className="flex items-center">
                      <ChevronRight className="flex-shrink-0 w-4 h-4 opacity-0 transition-all duration-300 text-primary group-hover:opacity-100 group-hover:translate-x-1" />
                    </div>
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
