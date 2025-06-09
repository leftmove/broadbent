"use client";

import { Avatar, AvatarFallback } from "components/ui/avatar";
import { Card, CardContent } from "components/ui/card";
import { Badge } from "components/ui/badge";
import { cn } from "lib/utils";
import { User, Bot, Copy, Check } from "lucide-react";
import { Button } from "components/ui/button";
import { useState } from "react";
import { format } from "date-fns";
import type { Message } from "state/functionality/messages";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="h-8 w-8 border">
          <AvatarFallback>
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {isUser ? "You" : "Assistant"}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(message.timestamp), "h:mm a")}
          </span>
          {message.isStreaming && (
            <Badge variant="secondary" className="text-xs">
              Typing...
            </Badge>
          )}
        </div>

        <Card
          className={cn(
            "max-w-2xl group relative",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted",
            message.isStreaming && "animate-pulse"
          )}
        >
          <CardContent className="p-3">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
              {message.isStreaming && (
                <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
              )}
            </div>
          </CardContent>

          {!isUser && message.content && (
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          )}
        </Card>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 border">
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}