import { observable } from "@legendapp/state";

export interface ChatState {
  isTyping: boolean;
  currentMessage: string;
  streamingMessageId: string | null;
  selectedModel: string;
  selectedProvider: string;
}

export const chatState = observable<ChatState>({
  isTyping: false,
  currentMessage: "",
  streamingMessageId: null,
  selectedModel: "gpt-4o",
  selectedProvider: "openai",
});