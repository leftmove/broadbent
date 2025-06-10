"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Doc } from "convex/_generated/dataModel";
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
} from "lucide-react";
import { useChatState } from "state/chat";
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
  const { selectedChatId, setSelectedChatId } = useChatState();
  const { signOut } = useAuthActions();
  const [searchQuery, setSearchQuery] = useState("");

  const handleNewChat = () => {
    void createChat({ title: "New Chat" }).then((chatId) => {
      setSelectedChatId(chatId);
    });
  };

  const handleSignOut = () => {
    void signOut();
  };

  const groupChatsByTime = (chats: Doc<"chats">[]) => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const groups = {
      today: [] as Doc<"chats">[],
      yesterday: [] as Doc<"chats">[],
      lastWeek: [] as Doc<"chats">[],
      older: [] as Doc<"chats">[],
    };

    chats.forEach((chat: Doc<"chats">) => {
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
        <div className="flex items-center justify-between mb-4">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <span className="font-serif text-lg italic font-semibold">
                Broadbent
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            onClick={toggleSidebar}
          >
            <PanelLeft className="w-5 h-5" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </div>

        {!collapsed ? (
          <>
            <Button
              onClick={() => setSelectedChatId(null)}
              className="w-full h-10 mb-4 font-sans text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Chat
            </Button>

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
            <Button
              onClick={() => setSelectedChatId(null)}
              className="w-10 h-10 p-0 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="sr-only">Chat</span>
            </Button>

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
          {chatGroups.yesterday.length > 0 && (
            <div className="mb-4">
              <div className="px-3 py-2 font-sans text-xs font-medium text-muted-foreground">
                Yesterday
              </div>
              <div className="space-y-1">
                {chatGroups.yesterday.map((chat: Doc<"chats">) => (
                  <Button
                    key={chat._id}
                    variant="ghost"
                    className={`flex justify-start w-full text-left font-sans text-sm h-auto py-2 px-3 rounded-lg ${
                      selectedChatId === chat._id
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                    onClick={() => setSelectedChatId(chat._id)}
                  >
                    <span className="truncate">{chat.title}</span>
                  </Button>
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
                  <Button
                    key={chat._id}
                    variant="ghost"
                    className={`justify-start w-full text-left font-sans text-sm h-auto py-2 px-3 rounded-lg ${
                      selectedChatId === chat._id
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                    onClick={() => setSelectedChatId(chat._id)}
                  >
                    <span className="truncate">{chat.title}</span>
                  </Button>
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
                  <Button
                    key={chat._id}
                    variant="ghost"
                    className={`justify-start w-full text-left font-sans text-sm h-auto py-2 px-3 rounded-lg ${
                      selectedChatId === chat._id
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                    onClick={() => setSelectedChatId(chat._id)}
                  >
                    <span className="truncate">{chat.title}</span>
                  </Button>
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
    </div>
  );
}
