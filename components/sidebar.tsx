"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Plus, Settings, MessageSquare, Search, Menu } from "lucide-react";
import { useChatState } from "state/ui/chat";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

interface SidebarProps {
  onSettingsClick: () => void;
}

export function Sidebar({ onSettingsClick }: SidebarProps) {
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

  const groupChatsByTime = (chats: typeof chats) => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const groups = {
      today: [] as typeof chats,
      yesterday: [] as typeof chats,
      lastWeek: [] as typeof chats,
      older: [] as typeof chats,
    };

    chats.forEach((chat) => {
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
    <div className="flex flex-col w-72 bg-card border-r border-border">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Menu className="w-5 h-5 text-muted-foreground" />
            <span className="font-semibold text-lg">Broadbent</span>
          </div>
        </div>
        
        <Button 
          onClick={handleNewChat} 
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-sans text-sm h-10 rounded-lg mb-4"
        >
          New Chat
        </Button>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search your threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 font-sans text-sm bg-input border-border rounded-lg"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {chatGroups.yesterday.length > 0 && (
          <div className="mb-4">
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground font-sans">
              Yesterday
            </div>
            <div className="space-y-1">
              {chatGroups.yesterday.map((chat) => (
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

        {chatGroups.lastWeek.length > 0 && (
          <div className="mb-4">
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground font-sans">
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
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground font-sans">
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

      <div className="p-4 border-t border-border">
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="justify-start w-full font-sans text-sm h-9 px-3 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg"
            onClick={onSettingsClick}
          >
            <Settings className="w-4 h-4 mr-3" />
            Settings
          </Button>
          <Button 
            variant="ghost" 
            className="w-full font-sans text-sm h-9 px-3 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg" 
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
