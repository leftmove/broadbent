"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "components/ui/button";
import { Textarea } from "components/ui/textarea";
import { Card } from "components/ui/card";
import { Send, Paperclip } from "lucide-react";
import { cn } from "lib/utils";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, disabled }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-4xl mx-auto">
        <Card className="p-2">
          <div className="flex items-end gap-2">
            <Button variant="ghost" size="sm" className="shrink-0">
              <Paperclip className="h-4 w-4" />
            </Button>

            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="min-h-[40px] max-h-32 resize-none border-0 shadow-none focus-visible:ring-0 p-2"
              disabled={disabled}
            />

            <Button
              onClick={handleSend}
              disabled={!message.trim() || disabled}
              size="sm"
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        <p className="text-xs text-muted-foreground text-center mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}