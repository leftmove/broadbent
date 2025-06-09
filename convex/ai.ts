"use node";

import { internalAction, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const generateResponse = internalAction({
  args: {
    conversationId: v.id("conversations"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Get conversation context
    const messages = await ctx.runQuery(internal.ai.getConversationContext, {
      conversationId: args.conversationId,
    });

    // For now, generate a simple response
    // In a real app, you would call an AI service here
    const responses = [
      "That's interesting! Can you tell me more?",
      "I understand. How can I help you with that?",
      "Thanks for sharing that with me.",
      "What would you like to know about that topic?",
      "That's a great question. Let me think about that.",
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];

    // Add AI response to conversation
    await ctx.runMutation(internal.messages.addMessage, {
      conversationId: args.conversationId,
      content: response,
      role: "assistant",
      isStreaming: false,
    });

    return null;
  },
});

export const getConversationContext = internalQuery({
  args: {
    conversationId: v.id("conversations"),
  },
  returns: v.array(v.object({
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  })),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation_timestamp", (q) => 
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .take(20); // Get last 20 messages for context

    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  },
});