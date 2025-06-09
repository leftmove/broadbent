"use client";

import { useConversations } from "hooks/useConversations";
import { Button } from "components/ui/button";
import { Card, CardContent } from "components/ui/card";
import { MessageSquare, Plus, Sparkles } from "lucide-react";

export function EmptyState() {
  const { createConversation } = useConversations();

  const handleNewChat = () => {
    createConversation("New Chat", "gpt-4o", "openai");
  };

  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <MessageSquare className="h-20 w-20 text-muted-foreground/40" />
            <Sparkles className="h-6 w-6 text-primary absolute -top-1 -right-1" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Welcome to Broadbent</h2>
          <p className="text-muted-foreground">
            Start a conversation with AI. Choose your preferred model and begin chatting.
          </p>
        </div>

        <Card className="text-left">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-sm">Quick Tips:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use different AI providers (OpenAI, Anthropic, Google)</li>
              <li>• Switch between models for different tasks</li>
              <li>• Your conversations are saved automatically</li>
              <li>• Responses stream in real-time</li>
            </ul>
          </CardContent>
        </Card>

        <Button onClick={handleNewChat} size="lg" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Start Your First Chat
        </Button>
      </div>
    </div>
  );
}