import { observable } from "@legendapp/state";

interface ChatState {
  selectedChatSlug: string | null;
}

export const chatState$ = observable<ChatState>({
  selectedChatSlug: null,
});