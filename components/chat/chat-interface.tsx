"use server";

import { Authenticated, Unauthenticated } from "convex/react";
import { Sidebar } from "components/sidebar";
import { AuthForm } from "components/auth/auth-form";
import { observer } from "@legendapp/state/react";

interface ChatInterfaceProps {
  children: React.ReactNode;
}

export const ChatInterface = observer(({ children }: ChatInterfaceProps) => {
  return (
    <div className="flex overflow-hidden h-screen bg-background">
      <Authenticated>
        <Sidebar />
        <div className="flex flex-col flex-1 min-h-0">
          <div className="h-[1px] border-b border-border/10"></div>
          {children}
        </div>
      </Authenticated>
      <Unauthenticated>
        <div className="flex flex-1 justify-center items-center p-8">
          <div className="space-y-8 w-full max-w-md">
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
