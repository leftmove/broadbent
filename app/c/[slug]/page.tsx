"use client";

import { useParams } from "next/navigation";
import { ChatWindow } from "@/components/chat/chat-window";
import { ChatInterface } from "@/components/chat/chat-interface";
import { RouteGuard } from "components/route-guard";

export default function ChatPage() {
  const params = useParams();
  const chatSlug = params.slug as string;

  return (
    <RouteGuard>
      <ChatInterface>
        <ChatWindow chatSlug={chatSlug} prompt={null} />
      </ChatInterface>
    </RouteGuard>
  );
}
