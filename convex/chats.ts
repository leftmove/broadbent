import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const slug = crypto.randomUUID();

    await ctx.db.insert("chats", {
      slug,
      title: args.title,
      userId,
    });

    return slug;
  },
});

export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const chat = await ctx.db
      .query("chats")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!chat) {
      return null;
    }

    if (chat.userId !== userId) {
      throw new Error("Not authorized to access this chat");
    }

    return chat;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("chats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const togglePin = mutation({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get the current chat by slug
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!chat) {
      throw new Error("Chat not found");
    }

    // Verify ownership
    if (chat.userId !== userId) {
      throw new Error("Not authorized to modify this chat");
    }

    // Toggle the pinned status
    return await ctx.db.patch(chat._id, {
      pinned: chat.pinned ? undefined : true,
    });
  },
});

export const updateTitle = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get the current chat by slug
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!chat) {
      throw new Error("Chat not found");
    }

    // Verify ownership
    if (chat.userId !== userId) {
      throw new Error("Not authorized to modify this chat");
    }

    // Update the title
    return await ctx.db.patch(chat._id, {
      title: args.title.trim(),
    });
  },
});

export const deleteChat = mutation({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get the current chat by slug
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!chat) {
      throw new Error("Chat not found");
    }

    // Verify ownership
    if (chat.userId !== userId) {
      throw new Error("Not authorized to delete this chat");
    }

    // Get all messages for this chat
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
      .collect();

    // Delete all messages
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete the chat
    await ctx.db.delete(chat._id);
    return true;
  },
});

// Legacy function for backward compatibility during migration
export const togglePinLegacy = mutation({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get the current chat
    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }

    // Verify ownership
    if (chat.userId !== userId) {
      throw new Error("Not authorized to modify this chat");
    }

    // Toggle the pinned status
    return await ctx.db.patch(args.chatId, {
      pinned: chat.pinned ? undefined : true,
    });
  },
});
