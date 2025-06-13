"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";

import { ChatMessage } from "components/chat/chat-message";
import { ChatInput } from "components/chat/chat-input";

interface ChatWindowProps {
  chatId: Id<"chats">;
  prompt?: string | null;
}

export function ChatWindow({ chatId, prompt }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [streamingMessage, setStreamingMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingChatId, setStreamingChatId] = useState<Id<"chats"> | null>(
    null
  );

  const messages = useQuery(api.messages.list, { chatId });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleStreamingUpdate = (
    streaming: boolean,
    content: string,
    chatId: Id<"chats"> | null
  ) => {
    setIsStreaming(streaming);
    setStreamingMessage(content);
    setStreamingChatId(chatId);
  };

  if (!messages) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-4 border-2 rounded-full border-primary border-t-transparent animate-spin"></div>
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-x-hidden overflow-y-auto"
      >
        <div className="max-w-full p-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message._id} message={message} />
          ))}

          {/* Streaming Message */}
          {isStreaming && streamingMessage && streamingChatId === chatId && (
            <div className="flex w-full px-4">
              <div className="rounded-lg px-4 py-3 max-w-[85%] break-words bg-secondary text-secondary-foreground mr-auto">
                <div className="prose prose-sm max-w-none break-words overflow-wrap-anywhere text-secondary-foreground [&_*]:text-secondary-foreground">
                  <p className="mb-3 leading-relaxed break-words last:mb-0">
                    {streamingMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isStreaming && !streamingMessage && streamingChatId === chatId && (
            <div className="flex w-full px-4">
              <div className="px-4 py-3 mr-auto rounded-lg bg-secondary text-secondary-foreground">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-secondary-foreground animate-bounce"></div>
                  <div
                    className="w-2 h-2 rounded-full bg-secondary-foreground animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-secondary-foreground animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4">
        <ChatInput
          chatId={chatId}
          className="max-w-4xl mx-auto"
          onStreamingUpdate={handleStreamingUpdate}
        />
      </div>
    </div>
  );
}
