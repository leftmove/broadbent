import { observable, observe } from "@legendapp/state";
import { Id } from "convex/_generated/dataModel";
import { useEffect, useState } from "react";

interface ChatState {
  selectedChatId: Id<"chats"> | null;
}

const chatState = observable<ChatState>({
  selectedChatId: null,
});

export const useChatState = () => {
  const [selectedChatId, setSelectedChatIdState] = useState<Id<"chats"> | null>(
    chatState.selectedChatId.get()
  );

  useEffect(() => {
    const dispose = observe(() => {
      setSelectedChatIdState(chatState.selectedChatId.get());
    });
    return dispose;
  }, []);

  return {
    selectedChatId,
    setSelectedChatId: (id: Id<"chats"> | null) =>
      chatState.selectedChatId.set(id),
  };
};
