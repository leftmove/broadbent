import { observable } from "@legendapp/state";

export interface ConversationState {
  activeConversationId: string | null;
  conversations: Array<{
    _id: string;
    title: string;
    model: string;
    provider: string;
    isActive: boolean;
    _creationTime: number;
  }>;
}

export const conversationState = observable<ConversationState>({
  activeConversationId: null,
  conversations: [],
});