"use client";

import { useObservable } from "@legendapp/state/react";
import { conversationState } from "state/functionality/conversations";
import { useMessages } from "hooks/useMessages";
import { MessageList } from "components/chat/message-list";
import { MessageInput } from "components/chat/message-input";
import { ChatHeader } from "components/chat/chat-header";
import { EmptyState } from "components/chat/empty-state";

export function ChatArea() {
  const activeConversationId = useObservable(
    conversationState.activeConversationId
  );
  const { messages, sendMessage, isTyping } = useMessages(
    activeConversationId.get()
  );

  if (!activeConversationId.get()) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader />
      <MessageList messages={messages} isTyping={isTyping} />
      <MessageInput onSendMessage={sendMessage} disabled={isTyping} />
    </div>
  );
}
