"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Doc } from "convex/_generated/dataModel";

import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Settings, MessageSquare, Search, PanelLeft, X } from "lucide-react";
import { ChatDeleteDialog } from "@/components/chat/chat-delete-dialog";
import { ChatItem } from "@/components/chat/chat-item";
import { UserProfile } from "components/user-profile";
import { SearchResults } from "components/search-results";
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
  const [isSearching, setIsSearching] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile } = useUIState();

  // Search results from full text search
  const searchResults = useQuery(
    api.messages.searchMessages,
    searchQuery.trim() ? { query: searchQuery } : "skip"
  ) || [];

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

    togglePinChat({ slug: chatSlug }).catch((error) => {
      console.error("Error toggling chat pin:", error);
    });
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
      await deleteChatMutation({ slug: chatToDelete.slug });

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

  // Filter chats based on search query (search chat titles)
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    
    const query = searchQuery.toLowerCase();
    return chats.filter(chat => 
      chat.title.toLowerCase().includes(query)
    );
  }, [chats, searchQuery]);

  // Get unique chats from search results
  const searchedChats = useMemo(() => {
    if (!searchQuery.trim() || searchResults.length === 0) return [];
    
    const uniqueChats = new Map<string, Doc<"chats">>();
    searchResults.forEach(result => {
      if (result.chat) {
        uniqueChats.set(result.chat._id, result.chat);
      }
    });
    
    return Array.from(uniqueChats.values());
  }, [searchResults, searchQuery]);

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

  // Determine which chats to display based on search state
  const displayChats = searchQuery.trim() 
    ? [...filteredChats, ...searchedChats].filter((chat, index, self) => 
        self.findIndex(c => c._id === chat._id) === index
      ) // Remove duplicates
    : chats;
  
  const chatGroups = groupChatsByTime(displayChats);
  
  // Track search state
  useEffect(() => {
    setIsSearching(searchQuery.trim().length > 0);
  }, [searchQuery]);
  
  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-card relative transition-all duration-150 pt-2 ease-in-out border-r-[1px] border-border",
        collapsed ? "max-w-16 w-16" : "max-w-72 w-72"
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
            <div className="flex items-center justify-between group">
              <Link href="/" className="block w-full">
                <Button className="w-full h-11 mb-4 font-sans text-sm font-medium rounded-lg rounded-r-none bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md border border-primary/10">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  <span>New Chat</span>
                </Button>
              </Link>
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-3/12 h-11 p-0 mb-4 rounded-lg rounded-l-none border-l-0 text-primary-foreground hover:text-primary-foreground hover:bg-primary/90 bg-primary transition-all duration-200 hover:shadow-md border border-primary/10"
                  onClick={toggleSidebar}
                >
                  <PanelLeft className="w-5 h-5 transition-transform duration-200 hover:scale-110" />
                  <span className="sr-only">Toggle Sidebar</span>
                </Button>
              )}
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
              <Search className={cn(
                "absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 transition-all duration-300",
                searchQuery ? "text-primary" : "text-muted-foreground group-focus-within:text-primary"
              )} />
              <Input
                placeholder="Search messages and chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "pl-10 pr-10 font-sans text-sm rounded-lg transition-all duration-300 shadow-sm",
                  "bg-background/50 border-border/60 backdrop-blur-sm",
                  "hover:bg-background/80 hover:border-border/80 hover:shadow-md",
                  "focus:ring-2 focus:ring-primary/30 focus:border-primary/60 focus:bg-background focus:shadow-lg",
                  searchQuery && "bg-background border-primary/40 shadow-md"
                )}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute transform -translate-y-1/2 right-3 top-1/2 text-muted-foreground hover:text-foreground transition-all duration-200 hover:bg-secondary/50 rounded-full p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <Link href="/" className="group relative">
              <Button className="w-11 h-11 p-0 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md">
                <MessageSquare className="w-5 h-5" />
                <span className="sr-only">New Chat</span>
              </Button>
              {/* Tooltip */}
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                New Chat
              </div>
            </Link>

            <Button
              variant="ghost"
              className="w-10 h-10 p-0 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 hover:shadow-md border border-transparent hover:border-primary/20"
            >
              <Search className="w-5 h-5" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="flex-1 px-2 overflow-y-auto">
          {isSearching ? (
            <div className="space-y-4">
              <div className="mb-4 px-3 py-3 bg-gradient-to-r from-secondary/20 via-secondary/30 to-secondary/20 rounded-xl mx-2 border border-border/30 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-foreground/90">
                    Search Results
                  </div>
                  {searchQuery && (
                    <div className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">
                      "{searchQuery}"
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    {displayChats.length} {displayChats.length === 1 ? 'chat' : 'chats'}
                  </span>
                  {searchResults.length > 0 && (
                    <span className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      {searchResults.length} message{searchResults.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
              
              {searchResults.length > 0 && (
                <div className="px-2">
                  <div className="mb-3 px-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">
                      Message Matches
                    </div>
                    <div className="flex-1 h-px bg-border/30"></div>
                  </div>
                  <SearchResults 
                    results={searchResults} 
                    query={searchQuery}
                    className="mb-6"
                  />
                </div>
              )}
              
              {displayChats.length > 0 && (
                <div>
                  <div className="mb-3 px-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">
                      Chats
                    </div>
                    <div className="flex-1 h-px bg-border/30"></div>
                  </div>
                  <div className="space-y-0.5">
                    {displayChats.map((chat) => (
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
          ) : (
            <>
              {chatGroups.pinned.length > 0 && (
            <div className="mb-4">
              <div className="px-3 py-2 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">
                  Pinned
                </div>
                <div className="flex-1 h-px bg-border/30"></div>
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
              <div className="px-3 py-2 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">
                  Today
                </div>
                <div className="flex-1 h-px bg-border/30"></div>
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
              <div className="px-3 py-2 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <div className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">
                  Yesterday
                </div>
                <div className="flex-1 h-px bg-border/30"></div>
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
              <div className="px-3 py-2 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">
                  Last Week
                </div>
                <div className="flex-1 h-px bg-border/30"></div>
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
              <div className="px-3 py-2 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <div className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">
                  Older
                </div>
                <div className="flex-1 h-px bg-border/30"></div>
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
            </>
          )}
        </div>
      )}

      {/* Spacer for collapsed state to push bottom section down */}
      <div className={cn("flex-1", { hidden: !collapsed })}></div>

      <div
        className={cn(
          "border-t border-border transition-all duration-150 ease-in-out",
          collapsed ? "p-2" : "p-4"
        )}
      >
        {/* Expanded view */}
        <div
          className={cn(
            "space-y-1 transition-all duration-150 ease-in-out",
            collapsed
              ? "opacity-0 max-h-0 overflow-hidden"
              : "opacity-100 max-h-40"
          )}
        >
          <Link href="/settings">
            <Button
              variant="ghost"
              className="justify-center w-full px-3 font-sans text-sm rounded-lg h-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Button>
          </Link>
          <UserProfile collapsed={false} />
        </div>

        {/* Collapsed view */}
        <div
          className={cn(
            "flex flex-col items-center space-y-2 transition-all duration-150 ease-in-out",
            collapsed
              ? "opacity-100 max-h-40"
              : "opacity-0 max-h-0 overflow-hidden"
          )}
        >
          <Link href="/settings">
            <Button
              variant="ghost"
              className="w-10 h-10 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            >
              <Settings className="w-5 h-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </Link>
          <UserProfile collapsed={true} />
        </div>
      </div>

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
