"use client";

import { Avatar, AvatarFallback } from "components/ui/avatar";
import { Card, CardContent } from "components/ui/card";
import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      <Avatar className="h-8 w-8 border">
        <AvatarFallback>
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-1 items-start">
        <span className="text-xs text-muted-foreground">Assistant</span>
        
        <Card className="bg-muted">
          <CardContent className="p-3">
            <div className="flex items-center space-x-1">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}