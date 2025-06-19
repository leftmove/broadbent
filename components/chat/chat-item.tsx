"use client";

import { memo, useState, useRef, useEffect } from "react";
import { Doc } from "convex/_generated/dataModel";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Pin, Trash2, Edit2, Check, X } from "lucide-react";
import { cn } from "lib/utils";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";

interface ChatItemProps {
  chat: Doc<"chats">;
  isSelected: boolean;
  onPinClick: (chatSlug: string, event: React.MouseEvent) => void;
  onDeleteClick: (chat: Doc<"chats">, event: React.MouseEvent) => void;
}

export const ChatItem = memo(function ChatItem({
  chat,
  isSelected,
  onPinClick,
  onDeleteClick,
}: ChatItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chat.title);
  const [isUpdating, setIsUpdating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateTitle = useMutation(api.chats.updateTitle);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditTitle(chat.title);
    setIsEditing(true);
  };

  const handleSave = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (editTitle.trim() === chat.title || !editTitle.trim()) {
      setIsEditing(false);
      setEditTitle(chat.title);
      return;
    }

    setIsUpdating(true);
    try {
      await updateTitle({ slug: chat.slug, title: editTitle.trim() });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating chat title:", error);
      setEditTitle(chat.title);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsEditing(false);
    setEditTitle(chat.title);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="relative group">
      {isEditing ? (
        <div className="relative">
          <div
            className={cn(
              "relative w-full px-3 py-2.5 text-sm font-medium transition-all duration-200 rounded-xl border border-primary/40 bg-primary/5 shadow-sm overflow-hidden"
            )}
          >
            {/* Pin indicator */}
            {chat.pinned && (
              <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-full"></div>
            )}
            
            <div className="relative z-10 flex items-center w-full min-w-0">
              <Input
                ref={inputRef}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className={cn(
                  "flex-1 h-6 px-0 py-0 border-0 bg-transparent text-sm font-medium leading-relaxed shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
                  chat.pinned && "ml-2"
                )}
                disabled={isUpdating}
              />
            </div>
          </div>

          {/* Edit action buttons */}
          <div className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center gap-0.5 bg-background/80 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-border/30">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-6 w-6 hover:bg-green-500/20 hover:text-green-600 rounded-md transition-colors"
              onClick={handleSave}
              disabled={isUpdating}
            >
              <Check className="w-3 h-3" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-6 w-6 hover:bg-red-500/20 hover:text-red-600 rounded-md transition-colors"
              onClick={handleCancel}
              disabled={isUpdating}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Link href={`/c/${chat.slug}`} className="relative block">
            <div
              className={cn(
                "relative w-full px-3 py-2.5 text-sm font-medium transition-all duration-200 rounded-xl border border-transparent cursor-pointer overflow-hidden",
                "hover:bg-secondary/50 hover:border-border/30 hover:shadow-sm",
                isSelected && "bg-primary/10 border-primary/20 text-primary shadow-sm",
                "group-hover:pr-20" // Make space for action buttons
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
              onClick={handleEditClick}
            >
              <Edit2 className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors" />
            </Button>

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
        </>
      )}
    </div>
  );
});
