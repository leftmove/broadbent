"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

import { ChatMessage } from "components/chat/chat-message";
import { ChatInput } from "components/chat/chat-input";
import { ChatNavigator } from "components/chat/chat-navigator";
import { cn } from "lib/utils";
import { useAIGeneration } from "state/ai";
import ReactMarkdown from "react-markdown";
import { CodeBlock } from "components/code-block";

interface ChatWindowProps {
  chatSlug: string;
  prompt?: string | null;
}

export function ChatWindow({ chatSlug, prompt }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [streamingMessage, setStreamingMessage] = useState("");
  const [streamingChatSlug, setStreamingChatSlug] = useState<string | null>(
    null
  );
  const [showSlidingResponse, setShowSlidingResponse] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState<string>("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isUserPromptVisible, setIsUserPromptVisible] = useState(true);

  const { streaming: isStreaming } = useAIGeneration();

  const chat = useQuery(api.chats.getBySlug, { slug: chatSlug });
  const messages = useQuery(
    api.messages.list,
    chat ? { chatId: chat._id } : "skip"
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Check if user is at bottom of scroll and if user prompt is visible
  const checkScrollPosition = () => {
    if (messagesContainerRef.current && messages && messages.length > 0) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50; // 50px threshold
      setIsAtBottom(isAtBottom);

      // Check if the last user message is visible
      const userMessages = messages.filter((m) => m.role === "user");
      if (userMessages.length > 0) {
        const lastUserMessageElement = document.getElementById(
          userMessages[userMessages.length - 1]._id
        );
        if (lastUserMessageElement) {
          const rect = lastUserMessageElement.getBoundingClientRect();
          const containerRect =
            messagesContainerRef.current.getBoundingClientRect();

          // Check if user message is above the visible area (scrolled past it going down)
          const isScrolledPastPrompt = rect.bottom < containerRect.top;

          // Only consider prompt "not visible" if we've scrolled past it (not if we're above it)
          const isVisible = !isScrolledPastPrompt;
          setIsUserPromptVisible(isVisible);
        }
      }

      return isAtBottom;
    }
    return true;
  };

  useEffect(() => {
    scrollToBottom();
    // Check scroll position after scrolling
    setTimeout(checkScrollPosition, 100);
  }, [messages, streamingMessage]);

  // Add scroll listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      const handleScroll = () => {
        checkScrollPosition();
      };

      container.addEventListener("scroll", handleScroll);
      // Initial check
      setTimeout(checkScrollPosition, 100);

      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [messages]);

  // Monitor messages and scroll position for sliding window
  useEffect(() => {
    if (messages && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];

      // Show sliding response when:
      // 1. Last message is assistant AND user prompt is not visible, OR
      // 2. Currently streaming
      if (
        (lastMessage.role === "assistant" && !isUserPromptVisible) ||
        isStreaming
      ) {
        if (lastMessage.role === "assistant") {
          setStreamingMessage(lastMessage.content || "");
          if (!showSlidingResponse) {
            setShowSlidingResponse(true);
            // Find the user message that prompted this response
            const userMessages = messages.filter((m) => m.role === "user");
            if (userMessages.length > 0) {
              const lastUserMessage = userMessages[userMessages.length - 1];
              setLastUserMessage(lastUserMessage.content);
            }
          }
        }
      }

      // Hide sliding response when:
      // 1. User prompt is visible AND not streaming, OR
      // 2. Last message is not assistant
      if (
        (isUserPromptVisible && !isStreaming) ||
        lastMessage.role !== "assistant"
      ) {
        if (showSlidingResponse) {
          setShowSlidingResponse(false);
        }
      }
    }
  }, [messages, isStreaming, isUserPromptVisible]);

  // This function is no longer needed as we're monitoring the streaming state directly
  const handleStreamingUpdate = () => {};

  if (!chat || !messages) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex flex-1 justify-center items-center">
          <div className="text-center">
            <div className="mx-auto mb-4 w-8 h-8 rounded-full border-2 animate-spin border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">
              {!chat ? "Loading chat..." : "Loading messages..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex overflow-hidden relative flex-col -mb-4 h-full border-r-0 border-border">
      {/* User prompt overlay - positioned within the chat window */}
      <div
        className={cn(
          "absolute top-0 right-0 left-0 z-50 pointer-events-none",
          "bg-background/95 transition-all duration-300 ease-out",
          "[mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]",
          showSlidingResponse
            ? "opacity-100 translate-y-0 backdrop-blur-[6px]"
            : "opacity-0 -translate-y-full backdrop-blur-none"
        )}
      >
        <div className="pb-3">
          <div className="px-4 pt-3">
            <div className="mx-auto w-[55%]">
              <div className="flex justify-end w-full">
                <div className="max-w-[80%] break-words">
                  <div className="px-3 py-2 rounded-lg shadow-md backdrop-blur-sm transition-all duration-200 bg-primary text-primary-foreground">
                    <div className="text-sm leading-relaxed">
                      {lastUserMessage}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={messagesContainerRef}
        className="overflow-y-auto overflow-x-hidden flex-1 px-4 pt-4 pb-48"
      >
        <div className="mx-auto space-y-6 w-[60%]">
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
              <div className="flex px-4 py-2 w-full">
                <div className="w-full max-w-none break-words">
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
              <div className="flex px-4 py-2 w-full">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full animate-bounce bg-muted-foreground"></div>
                  <div
                    className="w-2 h-2 rounded-full animate-bounce bg-muted-foreground"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full animate-bounce bg-muted-foreground"
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
          "absolute bottom-4 left-1/2 px-4 w-full max-w-4xl transition-all duration-300 transform -translate-x-1/2"
        )}
      >
        <ChatInput chatSlug={chatSlug} />
      </div>

      <ChatNavigator chatSlug={chatSlug} />

      {/* Debug info */}
      {/* <div className="fixed top-4 left-4 z-50 px-3 py-1.5 text-xs bg-black/80 text-white rounded">
        Prompt Visible: {isUserPromptVisible ? 'Yes' : 'No'} | Streaming: {isStreaming ? 'Yes' : 'No'} | Show: {showSlidingResponse ? 'Yes' : 'No'}
      </div> */}
    </div>
  );
}
