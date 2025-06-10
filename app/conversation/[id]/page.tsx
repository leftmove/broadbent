"use client";

import { useParams } from "next/navigation";
import { Id } from "convex/_generated/dataModel";
import { ChatWindow } from "components/chat-window";
import { ChatInterface } from "components/chat-interface";

export default function ConversationPage() {
  const params = useParams();
  const chatId = params.id as Id<"chats">;

  return (
    <ChatInterface>
      <ChatWindow chatId={chatId} prompt={null} />
    </ChatInterface>
  );
}
