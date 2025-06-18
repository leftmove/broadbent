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
      <Link href={`/c/${chat.slug}`} className="relative block">
        <div
          className={cn(
            "relative w-full px-3 py-2.5 text-sm font-medium transition-all duration-200 rounded-xl border border-transparent cursor-pointer overflow-hidden",
            "hover:bg-secondary/50 hover:border-border/30 hover:shadow-sm",
            isSelected && "bg-primary/10 border-primary/20 text-primary shadow-sm",
            "group-hover:pr-16" // Make space for action buttons
          )}
        >
          {/* Subtle background gradient for selected state */}
          {isSelected && (
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-xl"></div>
          )}
          
          {/* Pin indicator */}
          {chat.pinned && (
            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-full"></div>
          )}
          
          <div className="relative z-10 flex items-center w-full min-w-0">
            <span className={cn(
              "flex-1 text-left truncate leading-relaxed",
              chat.pinned && "ml-2"
            )}>
              {chat.title}
            </span>
          </div>
        </div>
      </Link>

      {/* Action buttons overlay */}
      <div className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-background/80 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-border/30">
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-6 w-6 hover:bg-secondary/70 rounded-md"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onPinClick(chat.slug, e);
          }}
        >
          <Pin
            className={cn(
              "h-3 w-3 transition-colors",
              chat.pinned
                ? "fill-current text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-6 w-6 hover:bg-destructive/20 hover:text-destructive rounded-md transition-colors"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDeleteClick(chat, e);
          }}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
