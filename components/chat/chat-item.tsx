"use client";

import { Doc } from "convex/_generated/dataModel";
import { Button } from "components/ui/button";
import { Pin, Trash2 } from "lucide-react";
import { cn } from "lib/utils";
import Link from "next/link";

interface ChatItemProps {
  chat: Doc<"chats">;
  isSelected: boolean;
  onPinClick: (chatSlug: string, event: React.MouseEvent) => void;
  onDeleteClick: (chat: Doc<"chats">, event: React.MouseEvent) => void;
}

export function ChatItem({
  chat,
  isSelected,
  onPinClick,
  onDeleteClick,
}: ChatItemProps) {
  return (
    <div className="relative group">
      <Link href={`/c/${chat.slug}`} className="group block relative">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-left h-auto py-2 px-3 text-sm font-normal transition-all duration-200 rounded-lg border border-transparent hover:bg-secondary/70",
            isSelected &&
              "bg-secondary/50 border-secondary text-secondary-foreground"
          )}
        >
          <div className="flex items-center w-full min-w-0">
            <span className="flex-1 truncate text-left">{chat.title}</span>
          </div>
        </Button>
      </Link>

      {/* Action buttons overlay */}
      <div className="absolute top-1.5 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 hover:bg-secondary/70"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Pin button clicked for chat:", chat.slug);
            onPinClick(chat.slug, e);
          }}
        >
          <Pin
            className={cn(
              "h-3 w-3",
              chat.pinned
                ? "fill-current text-primary"
                : "text-muted-foreground"
            )}
          />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 hover:bg-destructive/20 hover:text-destructive"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Delete clicked for chat:", chat.slug);
            onDeleteClick(chat, e);
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
