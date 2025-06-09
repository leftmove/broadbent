"use client";

import { useObservable } from "@legendapp/state/react";
import { sidebarState } from "state/ui/sidebar";
import { useConversations } from "hooks/useConversations";
import { useTheme } from "hooks/useTheme";
import { Button } from "components/ui/button";
import { ScrollArea } from "components/ui/scroll-area";
import { Separator } from "components/ui/separator";
import { Badge } from "components/ui/badge";
import {
  MessageSquare,
  Plus,
  Settings,
  Moon,
  Sun,
  Monitor,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { cn } from "lib/utils";
import { format } from "date-fns";

export function Sidebar() {
  const sidebar = useObservable(sidebarState);
  const {
    conversations,
    activeConversationId,
    createConversation,
    switchConversation,
  } = useConversations();
  const { mode, isSystemTheme, toggleTheme, setSystemTheme } = useTheme();

  const handleNewConversation = () => {
    createConversation("New Chat", "gpt-4o", "openai");
  };

  const toggleSidebar = () => {
    sidebarState.isOpen.set(!sidebar.isOpen);
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebar.isMobile && sidebar.isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-80 transform bg-background border-r transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          sidebar.isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Broadbent</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="lg:hidden"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <Button
              onClick={handleNewConversation}
              className="justify-start w-full"
              variant="default"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-2">
              {conversations.get().map((conversation) => (
                <Button
                  key={conversation._id}
                  variant={
                    activeConversationId.get() === conversation._id
                      ? "secondary"
                      : "ghost"
                  }
                  className="justify-start w-full h-auto p-3"
                  onClick={() => switchConversation(conversation._id)}
                >
                  <div className="flex flex-col items-start w-full space-y-1">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium truncate">
                        {conversation.title}
                      </span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {conversation.provider}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(
                        new Date(conversation._creationTime),
                        "MMM d, h:mm a"
                      )}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>

          <Separator />

          {/* Theme Toggle */}
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Theme</span>
              <div className="flex items-center space-x-1">
                <Button
                  variant={isSystemTheme ? "default" : "ghost"}
                  size="sm"
                  onClick={setSystemTheme}
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  variant={
                    !isSystemTheme && mode.get() === "light"
                      ? "default"
                      : "ghost"
                  }
                  size="sm"
                  onClick={mode.get() === "light" ? undefined : toggleTheme}
                >
                  <Sun className="w-4 h-4" />
                </Button>
                <Button
                  variant={
                    !isSystemTheme && mode.get() === "dark"
                      ? "default"
                      : "ghost"
                  }
                  size="sm"
                  onClick={mode.get() === "dark" ? undefined : toggleTheme}
                >
                  <Moon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="p-4 border-t">
            <Button variant="ghost" className="justify-start w-full">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      {!sidebar.isOpen && (
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="fixed z-40 top-4 left-4 lg:hidden"
        >
          <Menu className="w-4 h-4" />
        </Button>
      )}
    </>
  );
}
