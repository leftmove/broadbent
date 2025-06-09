import { observable } from "@legendapp/state";

export interface Message {
  _id: string;
  content: string;
  role: "user" | "assistant";
  isStreaming: boolean;
  timestamp: number;
  _creationTime: number;
}

export interface MessageState {
  messages: Record<string, Message[]>; // conversationId -> messages
  isLoading: boolean;
}

export const messageState = observable<MessageState>({
  messages: {},
  isLoading: false,
});