"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { Sidebar } from "components/sidebar";
import { AuthForm } from "components/auth/auth-form";
import { observer } from "@legendapp/state/react";

import { uiStore$ } from "state/ui";

interface ChatInterfaceProps {
  children: React.ReactNode;
}

export const ChatInterface = observer(({ children }: ChatInterfaceProps) => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Authenticated>
        <Sidebar
          collapsed={uiStore$.sidebar.collapsed.get()}
          toggleSidebar={() =>
            uiStore$.sidebar.collapsed.set(!uiStore$.sidebar.collapsed.get())
          }
        />
        <div className="flex flex-col flex-1 min-h-0">
          <div className="h-[1px] border-b border-border/10"></div>
          {children}
        </div>
      </Authenticated>
      <Unauthenticated>
        <div className="flex items-center justify-center flex-1 p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h1 className="mb-2 text-4xl font-bold">Broadent</h1>
              <p className="text-muted-foreground">
                A chat app with broad goals.
              </p>
            </div>
            <AuthForm />
          </div>
        </div>
      </Unauthenticated>
    </div>
  );
});
