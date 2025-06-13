"use client";

import { useParams } from "next/navigation";
import { ChatWindow } from "components/chat/chat-window";
import { ChatInterface } from "components/chat/chat-interface";
import { RouteGuard } from "components/route-guard";

export default function ConversationPage() {
  const params = useParams();
  const chatSlug = params.id as string;

  return (
    <RouteGuard>
      <ChatInterface>
        <ChatWindow chatSlug={chatSlug} prompt={null} />
      </ChatInterface>
    </RouteGuard>
  );
}
