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
  const { conversations, activeConversationId, createConversation, switchConversation } = useConversations();
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
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Broadbent</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="lg:hidden"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <Button
              onClick={handleNewConversation}
              className="w-full justify-start"
              variant="default"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Chat
            </Button>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <Button
                  key={conversation._id}
                  variant={activeConversationId === conversation._id ? "secondary" : "ghost"}
                  className="w-full justify-start p-3 h-auto"
                  onClick={() => switchConversation(conversation._id)}
                >
                  <div className="flex flex-col items-start space-y-1 w-full">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium truncate">
                        {conversation.title}
                      </span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {conversation.provider}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(conversation._creationTime), "MMM d, h:mm a")}
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
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={!isSystemTheme && mode === "light" ? "default" : "ghost"}
                  size="sm"
                  onClick={mode === "light" ? undefined : toggleTheme}
                >
                  <Sun className="h-4 w-4" />
                </Button>
                <Button
                  variant={!isSystemTheme && mode === "dark" ? "default" : "ghost"}
                  size="sm"
                  onClick={mode === "dark" ? undefined : toggleTheme}
                >
                  <Moon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="p-4 border-t">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
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
          className="fixed top-4 left-4 z-40 lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </Button>
      )}
    </>
  );
}