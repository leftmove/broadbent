import { Button } from "components/ui/button";
import { Pin, Trash2 } from "lucide-react";
import { Doc, Id } from "convex/_generated/dataModel";
import Link from "next/link";
import { cn } from "lib/utils";

interface ChatItemProps {
  chat: Doc<"chats">;
  isSelected: boolean;
  onPinClick: (chatId: Id<"chats">, event: React.MouseEvent) => void;
  onDeleteClick: (chat: Doc<"chats">, event: React.MouseEvent) => void;
}

export function ChatItem({
  chat,
  isSelected,
  onPinClick,
  onDeleteClick,
}: ChatItemProps) {
  return (
    <Link href={`/conversation/${chat._id}`} className="group block relative">
      <Button
        variant="ghost"
        className={cn(
          "justify-start w-full text-left font-sans text-sm h-auto py-2 pr-12 pl-3 rounded-lg",
          isSelected
            ? "bg-secondary text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        )}
      >
        <span className="truncate">{chat.title}</span>
      </Button>

      {/* Action buttons (visible on hover or if pinned) */}
      <div
        className={cn(
          "absolute right-1 top-1/2 -translate-y-1/2 flex items-center space-x-1 opacity-0 transition-opacity duration-150",
          (chat.pinned || isSelected) && "opacity-100",
          "group-hover:opacity-100"
        )}
      >
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "h-6 w-6 rounded-full p-0",
            chat.pinned
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={(e) => {
            console.log(
              "Pin clicked for chat:",
              chat._id,
              "Current pinned status:",
              chat.pinned
            );
            onPinClick(chat._id, e);
          }}
          title={chat.pinned ? "Unpin chat" : "Pin chat"}
        >
          <Pin
            className="h-3.5 w-3.5"
            fill={chat.pinned ? "currentColor" : "none"}
          />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 rounded-full p-0 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            console.log("Delete clicked for chat:", chat._id);
            onDeleteClick(chat, e);
          }}
          title="Delete chat"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Link>
  );
}
