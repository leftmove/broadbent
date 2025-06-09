"use client";

import { useObservable } from "@legendapp/state/react";
import { conversationState } from "state/functionality/conversations";
import { chatState } from "state/ui/chat";
import { useConversations } from "hooks/useConversations";
import { Button } from "components/ui/button";
import { Badge } from "components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import { MODELS, getModelName } from "lib/ai/providers";
import { Settings, Bot } from "lucide-react";

export function ChatHeader() {
  const conversations = useObservable(conversationState.conversations);
  const activeConversationId = useObservable(
    conversationState.activeConversationId
  );
  const chat = useObservable(chatState);

  const activeConversation = conversations.find(
    (c) => c._id === activeConversationId
  );

  const handleModelChange = (value: string) => {
    const [provider, model] = value.split(":");
    chatState.selectedProvider.set(provider);
    chatState.selectedModel.set(model);
  };

  const getCurrentValue = () => {
    return `${chat.selectedProvider}:${chat.selectedModel}`;
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">
            {activeConversation?.title.get() || "Chat"}
          </h2>
        </div>
        {activeConversation && (
          <Badge variant="outline">
            {getModelName(
              activeConversation.provider.get() as any,
              activeConversation.model.get()
            )}
          </Badge>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Select value={getCurrentValue()} onValueChange={handleModelChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(MODELS).map(([provider, models]) =>
              models.map((model) => (
                <SelectItem
                  key={`${provider}:${model.id}`}
                  value={`${provider}:${model.id}`}
                >
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {provider}
                    </Badge>
                    <span>{model.name}</span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
