"use client";

import { useState, useEffect } from "react";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { ChatWindow } from "components/chat-window";
import { Sidebar } from "components/sidebar";
import { AuthForm } from "components/auth-form";
import { ThemeToggle } from "components/theme-toggle";
import { useChatState } from "state/ui/chat";

export function ChatInterface() {
  const { selectedChatId } = useChatState();
  const session = useSessionContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session.loading === false) {
      setIsLoading(false);
    }
  }, [session.loading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session.doesSessionExist) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
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
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-h-0">
        <header className="flex items-center justify-end px-6 py-4 border-b border-border/30 bg-background/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center space-x-2">
            <ThemeToggle />
          </div>
        </header>
        <ChatWindow chatId={selectedChatId} />
      </div>
    </div>
  );
}