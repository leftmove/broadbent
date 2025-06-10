"use client";

import { useState } from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import { ChatWindow } from "components/chat-window";
import { Sidebar } from "components/sidebar";
import { AuthForm } from "components/auth-form";
import { ThemeToggle } from "components/theme-toggle";
import { useChatState } from "state/chat";
import { useUIState } from "state/ui";

export function ChatInterface() {
  const { selectedChatId } = useChatState();
  const { sidebarCollapsed, toggleSidebar } = useUIState();

  console.log(
    "ChatInterface render - selectedChatId:",
    selectedChatId,
    typeof selectedChatId
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Authenticated>
        <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
        <div className="flex flex-col flex-1 min-h-0">
          <header className="flex items-center justify-end flex-shrink-0 px-6 py-4 border-b border-border/30 bg-background/80 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <ThemeToggle />
            </div>
          </header>
          <ChatWindow chatId={selectedChatId} />
        </div>
      </Authenticated>
      <Unauthenticated>
        <div className="flex items-center justify-center flex-1 p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h1 className="mb-2 text-4xl font-bold">Broadent</h1>
              <p className="text-muted-foreground">
                AI-powered chat with smooth text generation
              </p>
            </div>
            <AuthForm />
          </div>
        </div>
      </Unauthenticated>
    </div>
  );
}
