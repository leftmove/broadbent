import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useObservable } from "@legendapp/state/react";
import { conversationState } from "state/functionality/conversations";
import { userState } from "state/functionality/user";
import { Id } from "convex/_generated/dataModel";

export function useConversations() {
  const user = useObservable(userState.currentUser);
  const conversations = useObservable(conversationState.conversations);
  const activeConversationId = useObservable(conversationState.activeConversationId);

  const conversationsQuery = useQuery(
    api.conversations.getConversations,
    user ? { userId: user._id as Id<"users"> } : "skip"
  );

  const createConversation = useMutation(api.conversations.createConversation);
  const setActiveConversation = useMutation(api.conversations.setActiveConversation);
  const updateConversationTitle = useMutation(api.conversations.updateConversationTitle);

  // Update state when query data changes
  if (conversationsQuery && conversationsQuery !== conversations) {
    conversationState.conversations.set(conversationsQuery);
    
    // Set active conversation if none is set
    const activeConv = conversationsQuery.find(c => c.isActive);
    if (activeConv && !activeConversationId) {
      conversationState.activeConversationId.set(activeConv._id);
    }
  }

  const createNewConversation = async (title: string, model: string, provider: string) => {
    if (!user) return;

    const conversationId = await createConversation({
      userId: user._id as Id<"users">,
      title,
      model,
      provider,
    });

    conversationState.activeConversationId.set(conversationId);
    return conversationId;
  };

  const switchConversation = async (conversationId: string) => {
    if (!user) return;

    await setActiveConversation({
      userId: user._id as Id<"users">,
      conversationId: conversationId as Id<"conversations">,
    });

    conversationState.activeConversationId.set(conversationId);
  };

  const updateTitle = async (conversationId: string, title: string) => {
    await updateConversationTitle({
      conversationId: conversationId as Id<"conversations">,
      title,
    });
  };

  return {
    conversations,
    activeConversationId,
    createConversation: createNewConversation,
    switchConversation,
    updateTitle,
    isLoading: conversationsQuery === undefined,
  };
}