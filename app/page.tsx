"use client";

import { Sidebar } from "components/layout/sidebar";
import { ChatArea } from "components/chat/chat-area";
import { useUser } from "hooks/useUser";

export default function HomePage() {
  useUser(); // Initialize user state

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <ChatArea />
      </main>
    </div>
  );
}
