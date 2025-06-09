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
      <div className="flex flex-col items-center justify-center flex-1 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold text-foreground">How can I help you today?</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
            <button className="p-5 text-left border border-border rounded-2xl hover:bg-secondary/30 transition-all duration-200 group shadow-sm hover:shadow-md">
              <div className="flex items-start space-x-3">
                <div className="text-lg">✨</div>
                <div>
                  <div className="font-medium text-sm text-foreground">Create</div>
                  <div className="text-xs text-muted-foreground font-sans leading-relaxed">Generate content and ideas</div>
                </div>
              </div>
            </button>
            
            <button className="p-5 text-left border border-border rounded-2xl hover:bg-secondary/30 transition-all duration-200 group shadow-sm hover:shadow-md">
              <div className="flex items-start space-x-3">
                <div className="text-lg">🔍</div>
                <div>
                  <div className="font-medium text-sm text-foreground">Explore</div>
                  <div className="text-xs text-muted-foreground font-sans leading-relaxed">Discover new topics and concepts</div>
                </div>
              </div>
            </button>
            
            <button className="p-5 text-left border border-border rounded-2xl hover:bg-secondary/30 transition-all duration-200 group shadow-sm hover:shadow-md">
              <div className="flex items-start space-x-3">
                <div className="text-lg">💡</div>
                <div>
                  <div className="font-medium text-sm text-foreground">Code</div>
                  <div className="text-xs text-muted-foreground font-sans leading-relaxed">Build and debug applications</div>
                </div>
              </div>
            </button>
            
            <button className="p-5 text-left border border-border rounded-2xl hover:bg-secondary/30 transition-all duration-200 group shadow-sm hover:shadow-md">
              <div className="flex items-start space-x-3">
                <div className="text-lg">📚</div>
                <div>
                  <div className="font-medium text-sm text-foreground">Learn</div>
                  <div className="text-xs text-muted-foreground font-sans leading-relaxed">Understand complex subjects</div>
                </div>
              </div>
            </button>
          </div>
          
          <div className="space-y-4 text-sm max-w-lg mx-auto">
            <button className="block w-full text-left px-4 py-3 rounded-xl hover:bg-secondary/30 transition-colors text-muted-foreground font-sans">
              How does AI work?
            </button>
            <button className="block w-full text-left px-4 py-3 rounded-xl hover:bg-secondary/30 transition-colors text-muted-foreground font-sans">
              Are black holes real?
            </button>
            <button className="block w-full text-left px-4 py-3 rounded-xl hover:bg-secondary/30 transition-colors text-muted-foreground font-sans">
              How many Rs are in the word "strawberry"?
            </button>
            <button className="block w-full text-left px-4 py-3 rounded-xl hover:bg-secondary/30 transition-colors text-muted-foreground font-sans">
              What is the meaning of life?
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 relative">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
          {messages.map((message) => (
            <ChatMessage key={message._id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border/50">
        <ChatInput chatId={chatId} />
      </div>
    </div>
  );
}
