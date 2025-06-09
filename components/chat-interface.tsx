"use client";

import { useState } from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import { ChatWindow } from "components/chat-window";
import { Sidebar } from "components/sidebar";
import { AuthForm } from "components/auth-form";
import { ThemeToggle } from "components/theme-toggle";
import { SettingsModal } from "components/settings-modal";
import { useChatState } from "state/ui/chat";

export function ChatInterface() {
  const { selectedChatId } = useChatState();
  const [showSettings, setShowSettings] = useState(false);

  console.log(
    "ChatInterface render - selectedChatId:",
    selectedChatId,
    typeof selectedChatId
  );

  return (
    <div className="flex h-screen bg-background">
      <Authenticated>
        <Sidebar onSettingsClick={() => setShowSettings(true)} />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b border-border">
            <h1 className="text-xl font-semibold">Broadbent</h1>
            <ThemeToggle />
          </header>
          <ChatWindow chatId={selectedChatId} />
        </div>
        <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
      </Authenticated>
      <Unauthenticated>
        <div className="flex items-center justify-center flex-1 p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h1 className="mb-2 text-4xl font-bold">Broadbent</h1>
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
