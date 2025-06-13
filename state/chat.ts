import { observable, observe } from "@legendapp/state";
import { useEffect, useState } from "react";

interface ChatState {
  selectedChatSlug: string | null;
}

const chatState = observable<ChatState>({
  selectedChatSlug: null,
});

export const useChatState = () => {
  const [selectedChatSlug, setSelectedChatSlugState] = useState<string | null>(
    chatState.selectedChatSlug.get()
  );

  useEffect(() => {
    const dispose = observe(() => {
      setSelectedChatSlugState(chatState.selectedChatSlug.get());
    });
    return dispose;
  }, []);

  return {
    selectedChatSlug,
    setSelectedChatSlug: (slug: string | null) =>
      chatState.selectedChatSlug.set(slug),
  };
};
