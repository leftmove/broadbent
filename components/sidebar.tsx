"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Doc, Id } from "convex/_generated/dataModel";

import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Settings, MessageSquare, Search, PanelLeft } from "lucide-react";
import { ChatDeleteDialog } from "@/components/chat/chat-delete-dialog";
import { ChatItem } from "@/components/chat/chat-item";
import { UserProfile } from "components/user-profile";
import { useUIState } from "state/ui";

import { cn } from "lib/utils";

interface SidebarProps {
  onSettingsClick?: () => void;
  collapsed?: boolean;
  toggleSidebar?: () => void;
}

interface ChatToDelete {
  slug: string;
  title: string;
}

export function Sidebar({ collapsed = false, toggleSidebar }: SidebarProps) {
  const chats = useQuery(api.chats.list) || [];
  const togglePinChat = useMutation(api.chats.togglePin);
  const deleteChatMutation = useMutation(api.chats.deleteChat);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile } = useUIState();

  // State for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<ChatToDelete | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Determine which chat is currently selected based on the URL
  const selectedChatSlug = pathname?.startsWith("/c/")
    ? pathname.split("/").pop()
    : null;

  const handlePinChat = (chatSlug: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    console.log("Toggling pin for chat:", chatSlug);

    try {
      togglePinChat({ slug: chatSlug })
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
      slug: chat.slug,
      title: chat.title,
    });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!chatToDelete) return;

    setIsDeleting(true);
    try {
      console.log("Deleting chat:", chatToDelete.slug);

      await deleteChatMutation({ slug: chatToDelete.slug });
      console.log("Chat deleted successfully");

      // If the deleted chat is the current one, navigate to home
      if (
        selectedChatSlug &&
        chatToDelete &&
        selectedChatSlug === chatToDelete.slug
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
        collapsed ? "max-w-18" : "max-w-72"
      )}
    >
      <div className="p-4">
        <div
          className={cn(
            "flex items-center mb-2 overflow-hidden transition-all duration-150 ease-in-out",
            collapsed ? "max-w-full" : "max-w-0 -mb-8"
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            onClick={toggleSidebar}
          >
            <PanelLeft className="w-5 h-5" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </div>
        {!collapsed ? (
          <>
            <div className="flex items-center justify-between">
              <Link href="/" className="block w-full">
                <Button className="w-full h-10 mb-4 font-sans text-sm rounded-lg rounded-r-none bg-primary text-primary-foreground hover:bg-primary/90">
                  New Chat
                </Button>
              </Link>
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-3/12 h-10 p-0 mb-4 rounded-lg rounded-l-none border-l-1 text-primary-foreground hover:text-primary-foreground hover:bg-primary/90 bg-primary/95"
                  onClick={toggleSidebar}
                >
                  <PanelLeft className="w-6 h-6" />
                  <span className="sr-only">Toggle Sidebar</span>
                </Button>
              )}
            </div>
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
                <span className="sr-only">New Chat</span>
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
                    isSelected={selectedChatSlug === chat.slug}
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
                    isSelected={selectedChatSlug === chat.slug}
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
                    isSelected={selectedChatSlug === chat.slug}
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
                Last week
              </div>
              <div className="space-y-1">
                {chatGroups.lastWeek.map((chat) => (
                  <ChatItem
                    key={chat._id}
                    chat={chat}
                    isSelected={selectedChatSlug === chat.slug}
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
                    isSelected={selectedChatSlug === chat.slug}
                    onPinClick={handlePinChat}
                    onDeleteClick={handleDeleteClick}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Spacer for collapsed state to push bottom section down */}
      {collapsed && <div className="flex-1" />}

      <div className={cn("border-t border-border", collapsed ? "p-2" : "p-4")}>
        {!collapsed ? (
          <div className="space-y-1">
            <Link href="/settings">
              <Button
                variant="ghost"
                className="justify-center w-full px-3 font-sans text-sm rounded-lg h-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              >
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </Button>
            </Link>
            <UserProfile collapsed={collapsed} />
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
            <UserProfile collapsed={collapsed} />
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
