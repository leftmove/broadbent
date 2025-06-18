import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const send = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify the chat belongs to the user
    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== userId) {
      throw new Error("Chat not found or access denied");
    }

    return await ctx.db.insert("messages", {
      chatId: args.chatId,
      content: args.content,
      role: args.role,
      userId,
    });
  },
});

export const sendBySlug = mutation({
  args: {
    chatSlug: v.string(),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    thinking: v.optional(v.string()),
    modelId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get the chat by slug and verify ownership
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_slug", (q) => q.eq("slug", args.chatSlug))
      .first();

    if (!chat || chat.userId !== userId) {
      throw new Error("Chat not found or access denied");
    }

    return await ctx.db.insert("messages", {
      chatId: chat._id,
      content: args.content,
      role: args.role,
      userId,
      thinking: args.thinking,
      modelId: args.modelId,
    });
  },
});

export const update = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get the message and verify ownership
    const message = await ctx.db.get(args.messageId);
    if (!message || message.userId !== userId) {
      throw new Error("Message not found or access denied");
    }

    // Update the message content
    await ctx.db.patch(args.messageId, {
      content: args.content,
    });

    return args.messageId;
  },
});

export const updateWithThinking = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
    thinking: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get the message and verify ownership
    const message = await ctx.db.get(args.messageId);
    if (!message || message.userId !== userId) {
      throw new Error("Message not found or access denied");
    }

    // Update the message content and thinking
    await ctx.db.patch(args.messageId, {
      content: args.content,
      thinking: args.thinking,
    });

    return args.messageId;
  },
});

export const updateBySlug = mutation({
  args: {
    chatSlug: v.string(),
    messageSlug: v.id("messages"),
    content: v.string(),
    thinking: v.optional(v.string()),
    type: v.optional(v.union(v.literal("error"), v.literal("normal"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get the chat by slug and verify ownership
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_slug", (q) => q.eq("slug", args.chatSlug))
      .first();

    if (!chat || chat.userId !== userId) {
      throw new Error("Chat not found or access denied");
    }

    // Get the message and verify it belongs to this chat and user
    const message = await ctx.db.get(args.messageSlug);
    if (!message || message.userId !== userId || message.chatId !== chat._id) {
      throw new Error("Message not found or access denied");
    }

    // Update the message content and thinking
    await ctx.db.patch(args.messageSlug, {
      content: args.content,
      thinking: args.thinking,
      type: args.type,
    });

    return args.messageSlug;
  },
});

export const list = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Verify the chat belongs to the user
    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== userId) {
      return [];
    }

    return await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .collect();
  },
});

export const listBySlug = query({
  args: {
    chatSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Get the chat by slug and verify ownership
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_slug", (q) => q.eq("slug", args.chatSlug))
      .first();

    if (!chat || chat.userId !== userId) {
      return [];
    }

    return await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
      .order("asc")
      .collect();
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message || message.userId !== userId) {
      throw new Error("Message not found or access denied");
    }

    await ctx.db.delete(args.messageId);
    return args.messageId;
  },
});

export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message || message.userId !== userId) {
      throw new Error("Message not found or access denied");
    }

    await ctx.db.patch(args.messageId, {
      content: args.content,
    });

    return args.messageId;
  },
});

export const searchMessages = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    if (!args.query.trim()) {
      return [];
    }

    // Search messages using full text search
    const searchResults = await ctx.db
      .query("messages")
      .withSearchIndex("search_messages", (q) => 
        q.search("content", args.query)
      )
      .filter((q) => q.eq(q.field("userId"), userId))
      .take(50);

    // Get the associated chats for each message
    const messagesWithChats = await Promise.all(
      searchResults.map(async (message) => {
        const chat = await ctx.db.get(message.chatId);
        return {
          ...message,
          chat,
        };
      })
    );

    return messagesWithChats.filter(msg => msg.chat !== null);
  },
});
