import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";

export function useMessages(conversationId: string | null) {
  const messages = useQuery(
    api.messages.getMessages,
    conversationId ? { conversationId: conversationId as Id<"conversations"> } : "skip"
  );

  const sendMessageMutation = useMutation(api.messages.sendMessage);

  const sendMessage = async (content: string) => {
    if (!conversationId) return;

    await sendMessageMutation({
      conversationId: conversationId as Id<"conversations">,
      content,
      role: "user",
    });
  };

  return {
    messages: messages || [],
    sendMessage,
    isLoading: messages === undefined,
  };
}