"use client";

import { useState } from "react";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

import { Menu } from "lucide-react";

import { cn } from "lib/utils";

export function ChatNavigator({ chatSlug }: { chatSlug: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const chat = useQuery(api.chats.getBySlug, { slug: chatSlug });
  const messages = useQuery(
    api.messages.list,
    chat ? { chatId: chat._id } : "skip"
  );

  return null;

  if (!chat || !messages) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute z-40 flex flex-col items-center transition-all duration-300 p-2 border rounded-lg drop-shadow-sm border-border top-6 right-6",
        isOpen
          ? "bg-background/100 opacity-100 max-w-7xl max-h-7xl"
          : "bg-background/50 opacity-50 max-w-10 max-h-10"
      )}
    >
      <Menu
        className="z-50 w-10 h-10 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      />
    </div>
  );
}
