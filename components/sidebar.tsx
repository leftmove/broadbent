"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Button } from "components/ui/button";
import { Plus, Settings, MessageSquare } from "lucide-react";
import { useChatState } from "state/ui/chat";
import { useAuthActions } from "@convex-dev/auth/react";

interface SidebarProps {
  onSettingsClick: () => void;
}

export function Sidebar({ onSettingsClick }: SidebarProps) {
  const chats = useQuery(api.chats.list) || [];
  const createChat = useMutation(api.chats.create);
  const { selectedChatId, setSelectedChatId } = useChatState();
  const { signOut } = useAuthActions();

  const handleNewChat = () => {
    void createChat({ title: "New Chat" }).then((chatId) => {
      setSelectedChatId(chatId);
    });
  };

  const handleSignOut = () => {
    void signOut();
  };

  return (
    <div className="flex flex-col w-64 border-r border-border bg-card">
      <div className="p-4 border-b border-border">
        <Button onClick={handleNewChat} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 p-2 overflow-y-auto">
        {chats.map((chat) => (
          <Button
            key={chat._id}
            variant={selectedChatId === chat._id ? "secondary" : "ghost"}
            className="justify-start w-full mb-1"
            onClick={() => setSelectedChatId(chat._id)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            <span className="truncate">{chat.title}</span>
          </Button>
        ))}
      </div>

      <div className="p-4 space-y-2 border-t border-border">
        <Button
          variant="ghost"
          className="justify-start w-full"
          onClick={onSettingsClick}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
        <Button variant="ghost" className="w-full" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}
