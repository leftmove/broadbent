import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useObservable } from "@legendapp/state/react";
import { messageState } from "state/functionality/messages";
import { chatState } from "state/ui/chat";
import { userState } from "state/functionality/user";
import { streamAIResponse } from "lib/ai/stream";
import { Id } from "convex/_generated/dataModel";

export function useMessages(conversationId: string | null) {
  const messages = useObservable(messageState.messages);
  const chat = useObservable(chatState);
  const user = useObservable(userState);

  const messagesQuery = useQuery(
    api.messages.getMessages,
    conversationId ? { conversationId: conversationId as Id<"conversations"> } : "skip"
  );

  const addMessage = useMutation(api.messages.addMessage);
  const updateMessage = useMutation(api.messages.updateMessage);

  // Update state when query data changes
  if (messagesQuery && conversationId) {
    messageState.messages[conversationId].set(messagesQuery);
  }

  const sendMessage = async (content: string) => {
    if (!conversationId || !user.currentUser) return;

    chatState.isTyping.set(true);

    try {
      // Add user message
      await addMessage({
        conversationId: conversationId as Id<"conversations">,
        content,
        role: "user",
      });

      // Create assistant message placeholder
      const assistantMessageId = await addMessage({
        conversationId: conversationId as Id<"conversations">,
        content: "",
        role: "assistant",
        isStreaming: true,
      });

      chatState.streamingMessageId.set(assistantMessageId);

      // Get API key for selected provider
      const apiKey = user.apiKeys[chat.selectedProvider];
      if (!apiKey) {
        throw new Error(`No API key found for ${chat.selectedProvider}`);
      }

      // Prepare messages for AI
      const conversationMessages = messages[conversationId] || [];
      const aiMessages = [
        ...conversationMessages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        { role: 'user' as const, content },
      ];

      let fullResponse = '';

      // Stream AI response
      await streamAIResponse({
        provider: chat.selectedProvider as any,
        model: chat.selectedModel,
        apiKey,
        messages: aiMessages,
        onChunk: (chunk) => {
          fullResponse += chunk;
          updateMessage({
            messageId: assistantMessageId,
            content: fullResponse,
            isStreaming: true,
          });
        },
        onComplete: (finalText) => {
          updateMessage({
            messageId: assistantMessageId,
            content: finalText,
            isStreaming: false,
          });
          chatState.streamingMessageId.set(null);
        },
        onError: (error) => {
          console.error('AI streaming error:', error);
          updateMessage({
            messageId: assistantMessageId,
            content: `Error: ${error.message}`,
            isStreaming: false,
          });
          chatState.streamingMessageId.set(null);
        },
      });
    } finally {
      chatState.isTyping.set(false);
    }
  };

  return {
    messages: conversationId ? messages[conversationId] || [] : [],
    sendMessage,
    isTyping: chat.isTyping,
    streamingMessageId: chat.streamingMessageId,
  };
}