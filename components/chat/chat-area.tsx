"use client";

import { useConversations } from "hooks/useConversations";
import { useMessages } from "hooks/useMessages";
import { MessageList } from "components/chat/message-list";
import { MessageInput } from "components/chat/message-input";
import { ChatHeader } from "components/chat/chat-header";
import { EmptyState } from "components/chat/empty-state";

export function ChatArea() {
  const { activeConversationId } = useConversations();
  const { messages, sendMessage, isLoading } = useMessages(activeConversationId);

  if (!activeConversationId) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader />
      <MessageList messages={messages} isTyping={false} />
      <MessageInput onSendMessage={sendMessage} disabled={isLoading} />
    </div>
  );
}
