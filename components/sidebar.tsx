"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Doc, Id } from "convex/_generated/dataModel";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import {
  Plus,
  Settings,
  MessageSquare,
  Search,
  PanelLeft,
  ChevronLeft,
  ChevronRight,
  Pin,
  Trash2,
} from "lucide-react";
import { ChatDeleteDialog } from "components/chat-delete-dialog";
import { ChatItem } from "components/chat-item";
// import { useChatState } from "state/chat";
import { useRouter, usePathname } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import Link from "next/link";
import { cn } from "lib/utils";

interface SidebarProps {
  onSettingsClick?: () => void;
  collapsed?: boolean;
  toggleSidebar?: () => void;
}

export function Sidebar({
  onSettingsClick,
  collapsed = false,
  toggleSidebar,
}: SidebarProps) {
  const chats = useQuery(api.chats.list) || [];
  const createChat = useMutation(api.chats.create);
  const togglePinChat = useMutation(api.chats.togglePin);
  const deleteChatMutation = useMutation(api.chats.deleteChat);
  const { signOut } = useAuthActions();
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  // State for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<{
    id: Id<"chats">;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Determine which chat is currently selected based on the URL
  const selectedChatIdString = pathname?.startsWith("/conversation/")
    ? pathname.split("/").pop()
    : null;

  const handleNewChat = async () => {
    try {
      const chatId = await createChat({ title: "New Chat" });
      // Navigate to the conversation page using the router
      router.push(`/conversation/${chatId}`);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  const handlePinChat = (chatId: Id<"chats">, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    console.log("Toggling pin for chat:", chatId);

    try {
      togglePinChat({ chatId })
        .then(() => console.log("Pin toggled successfully"))
        .catch((error) => {
          console.error("Error toggling chat pin:", error);
        });
    } catch (error) {
      console.error("Error in pin handler:", error);
    }
  };

  const handleDeleteClick = (chat: Doc<"chats">, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    setChatToDelete({
      id: chat._id,
      title: chat.title,
    });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!chatToDelete) return;

    setIsDeleting(true);
    try {
      console.log("Deleting chat:", chatToDelete.id);

      await deleteChatMutation({ chatId: chatToDelete.id });
      console.log("Chat deleted successfully");

      // If the deleted chat is the current one, navigate to home
      if (
        selectedChatIdString &&
        chatToDelete &&
        selectedChatIdString === String(chatToDelete.id)
      ) {
        router.push("/");
      }

      setDeleteDialogOpen(false);
      setChatToDelete(null);
    } catch (error) {
      console.error("Error deleting chat:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSignOut = () => {
    void signOut();
  };

  const groupChatsByTime = (chats: Doc<"chats">[]) => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const groups = {
      pinned: [] as Doc<"chats">[],
      today: [] as Doc<"chats">[],
      yesterday: [] as Doc<"chats">[],
      lastWeek: [] as Doc<"chats">[],
      older: [] as Doc<"chats">[],
    };

    // First sort the chats by creation time, newest first
    // This ensures that within each group, newest chats appear first
    const sortedChats = [...chats].sort(
      (a, b) => b._creationTime - a._creationTime
    );

    sortedChats.forEach((chat: Doc<"chats">) => {
      // First sort pinned chats
      if (chat.pinned) {
        groups.pinned.push(chat);
        return;
      }

      // Then group non-pinned chats by time
      const chatDate = new Date(chat._creationTime);
      if (chatDate.toDateString() === now.toDateString()) {
        groups.today.push(chat);
      } else if (chatDate.toDateString() === yesterday.toDateString()) {
        groups.yesterday.push(chat);
      } else if (chatDate > lastWeek) {
        groups.lastWeek.push(chat);
      } else {
        groups.older.push(chat);
      }
    });

    return groups;
  };

  const chatGroups = groupChatsByTime(chats);

  return (
    <div
      className={cn(
        "flex flex-col h-full border-r bg-card border-border transition-all duration-150 ease-in-out",
        collapsed ? "w-16" : "w-72"
      )}
    >
      <div className="p-4">
        <div className="flex items-center justify-start mb-4">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <span className="mx-auto font-sans text-lg font-bold">
                Broadbent
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 ml-auto rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            onClick={toggleSidebar}
          >
            <PanelLeft className="w-5 h-5" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </div>

        {!collapsed ? (
          <>
            <Link href="/" className="block w-full">
              <Button className="w-full h-10 mb-4 font-sans text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                New Chat
              </Button>
            </Link>

            <div className="relative">
              <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
              <Input
                placeholder="Search your threads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 font-sans text-sm rounded-lg bg-input border-border"
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Link href="/">
              <Button className="w-10 h-10 p-0 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                <MessageSquare className="w-5 h-5" />
                <span className="sr-only">Chat</span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              className="w-10 h-10 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            >
              <Search className="w-5 h-5" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="flex-1 px-2 overflow-y-auto">
          {chatGroups.pinned.length > 0 && (
            <div className="mb-4">
              <div className="px-3 py-2 font-sans text-xs font-medium text-muted-foreground">
                Pinned
              </div>
              <div className="space-y-1">
                {chatGroups.pinned.map((chat) => (
                  <ChatItem
                    key={chat._id}
                    chat={chat}
                    isSelected={selectedChatIdString === chat._id}
                    onPinClick={handlePinChat}
                    onDeleteClick={handleDeleteClick}
                  />
                ))}
              </div>
            </div>
          )}

          {chatGroups.today.length > 0 && (
            <div className="mb-4">
              <div className="px-3 py-2 font-sans text-xs font-medium text-muted-foreground">
                Today
              </div>
              <div className="space-y-1">
                {chatGroups.today.map((chat) => (
                  <ChatItem
                    key={chat._id}
                    chat={chat}
                    isSelected={selectedChatIdString === chat._id}
                    onPinClick={handlePinChat}
                    onDeleteClick={handleDeleteClick}
                  />
                ))}
              </div>
            </div>
          )}

          {chatGroups.yesterday.length > 0 && (
            <div className="mb-4">
              <div className="px-3 py-2 font-sans text-xs font-medium text-muted-foreground">
                Yesterday
              </div>
              <div className="space-y-1">
                {chatGroups.yesterday.map((chat) => (
                  <ChatItem
                    key={chat._id}
                    chat={chat}
                    isSelected={selectedChatIdString === chat._id}
                    onPinClick={handlePinChat}
                    onDeleteClick={handleDeleteClick}
                  />
                ))}
              </div>
            </div>
          )}

          {chatGroups.lastWeek.length > 0 && (
            <div className="mb-4">
              <div className="px-3 py-2 font-sans text-xs font-medium text-muted-foreground">
                Last 7 Days
              </div>
              <div className="space-y-1">
                {chatGroups.lastWeek.map((chat) => (
                  <ChatItem
                    key={chat._id}
                    chat={chat}
                    isSelected={selectedChatIdString === chat._id}
                    onPinClick={handlePinChat}
                    onDeleteClick={handleDeleteClick}
                  />
                ))}
              </div>
            </div>
          )}

          {chatGroups.older.length > 0 && (
            <div className="mb-4">
              <div className="px-3 py-2 font-sans text-xs font-medium text-muted-foreground">
                Older
              </div>
              <div className="space-y-1">
                {chatGroups.older.map((chat) => (
                  <ChatItem
                    key={chat._id}
                    chat={chat}
                    isSelected={selectedChatIdString === chat._id}
                    onPinClick={handlePinChat}
                    onDeleteClick={handleDeleteClick}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className={cn("border-t border-border", collapsed ? "p-2" : "p-4")}>
        {!collapsed ? (
          <div className="space-y-1">
            <Link href="/settings">
              <Button
                variant="ghost"
                className="justify-start w-full px-3 font-sans text-sm rounded-lg h-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              >
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full px-3 font-sans text-sm rounded-lg h-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Link href="/settings">
              <Button
                variant="ghost"
                className="w-10 h-10 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              >
                <Settings className="w-5 h-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-10 h-10 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              onClick={handleSignOut}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span className="sr-only">Sign Out</span>
            </Button>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <ChatDeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setChatToDelete(null);
        }}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        chatTitle={chatToDelete?.title || ""}
      />
    </div>
  );
}
