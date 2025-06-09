import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useObservable } from "@legendapp/state/react";
import { userState } from "state/functionality/user";
import { Id } from "convex/_generated/dataModel";

export function useConversations() {
  const user = useObservable(userState.currentUser);
  
  const conversations = useQuery(
    api.conversations.getConversations,
    user.get() ? { userId: user.get()!._id as Id<"users"> } : "skip"
  );

  const activeConversation = useQuery(
    api.conversations.getActiveConversation,
    user.get() ? { userId: user.get()!._id as Id<"users"> } : "skip"
  );

  const createConversationMutation = useMutation(api.conversations.createConversation);
  const setActiveConversationMutation = useMutation(api.conversations.setActiveConversation);
  const updateConversationTitleMutation = useMutation(api.conversations.updateConversationTitle);

  const createConversation = async (title: string, model: string, provider: string) => {
    if (!user.get()) return;

    return await createConversationMutation({
      userId: user.get()!._id as Id<"users">,
      title,
      model,
      provider,
    });
  };

  const switchConversation = async (conversationId: string) => {
    if (!user.get()) return;

    return await setActiveConversationMutation({
      userId: user.get()!._id as Id<"users">,
      conversationId: conversationId as Id<"conversations">,
    });
  };

  const updateTitle = async (conversationId: string, title: string) => {
    return await updateConversationTitleMutation({
      conversationId: conversationId as Id<"conversations">,
      title,
    });
  };

  return {
    conversations: conversations || [],
    activeConversationId: activeConversation?._id || null,
    createConversation,
    switchConversation,
    updateTitle,
    isLoading: conversations === undefined,
  };
}