"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

import { ChatMessage } from "components/chat/chat-message";
import { ChatInput } from "components/chat/chat-input";
import { ChatNavigator } from "components/chat/chat-navigator";
import { SearchProgressBar } from "components/chat/search-progress-bar";
import { cn } from "lib/utils";

interface ChatWindowProps {
  chatSlug: string;
  prompt?: string | null;
}

export function ChatWindow({ chatSlug, prompt }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [streamingMessage, setStreamingMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingChatSlug, setStreamingChatSlug] = useState<string | null>(
    null
  );

  const chat = useQuery(api.chats.getBySlug, { slug: chatSlug });
  const messages = useQuery(
    api.messages.list,
    chat ? { chatId: chat._id } : "skip"
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleStreamingUpdate = (
    streaming: boolean,
    content: string,
    chatSlug: string | null
  ) => {
    setIsStreaming(streaming);
    setStreamingMessage(content);
    setStreamingChatSlug(chatSlug);
  };

  if (!chat || !messages) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-4 border-2 rounded-full border-primary border-t-transparent animate-spin"></div>
            <p className="text-muted-foreground">
              {!chat ? "Loading chat..." : "Loading messages..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full -mb-4 overflow-hidden border-r-0 border-border">
      <div
        ref={messagesContainerRef}
        className="flex-1 px-4 pt-4 pb-48 overflow-x-hidden overflow-y-auto"
      >
        <div className="w-11/12 mx-auto space-y-6">
          {messages.map((message) => (
            <ChatMessage
              key={message._id}
              message={message}
              chatSlug={chatSlug}
            />
          ))}

          {/* Streaming Message */}
          {isStreaming &&
            streamingMessage &&
            streamingChatSlug === chatSlug && (
              <div className="flex w-full px-4 py-2">
                <div className="w-full break-words max-w-none">
                  <div className="prose prose-sm max-w-none break-words text-foreground [&_*]:text-foreground">
                    <p className="mb-3 leading-relaxed break-words last:mb-0">
                      {streamingMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* Loading Indicator */}
          {isStreaming &&
            !streamingMessage &&
            streamingChatSlug === chatSlug && (
              <div className="flex w-full px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></div>
                  <div
                    className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            )}
        </div>
        <div ref={messagesEndRef} />
      </div>
      <div
        className={cn(
          "absolute w-full max-w-4xl px-4 transform -translate-x-1/2 bottom-4 transition-all duration-300 left-1/2"
        )}
      >
        <SearchProgressBar />
        <ChatInput chatSlug={chatSlug} />
      </div>
      <ChatNavigator chatSlug={chatSlug} />
    </div>
  );
}
