"use client";

import { useObservable } from "@legendapp/state/react";
import { conversationState } from "state/functionality/conversations";
import { useMessages } from "hooks/useMessages";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ChatHeader } from "./ChatHeader";
import { EmptyState } from "./EmptyState";

export function ChatArea() {
  const activeConversationId = useObservable(conversationState.activeConversationId);
  const { messages, sendMessage, isTyping } = useMessages(activeConversationId);

  if (!activeConversationId) {
    return <EmptyState />;
  }

  return (
    <div className="flex h-full flex-col">
      <ChatHeader />
      <MessageList messages={messages} isTyping={isTyping} />
      <MessageInput onSendMessage={sendMessage} disabled={isTyping} />
    </div>
  );
}