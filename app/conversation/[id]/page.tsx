"use client";

import { useParams } from "next/navigation";
import { Id } from "convex/_generated/dataModel";
import { ChatWindow } from "components/chat-window";
import { ChatInterface } from "components/chat-interface";
import { RouteGuard } from "components/route-guard";

export default function ConversationPage() {
  const params = useParams();
  const chatId = params.id as Id<"chats">;

  return (
    <RouteGuard>
      <ChatInterface>
        <ChatWindow chatId={chatId} prompt={null} />
      </ChatInterface>
    </RouteGuard>
  );
}
