import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getConversations = query({
  args: { userId: v.id("users") },
  returns: v.array(v.object({
    _id: v.id("conversations"),
    _creationTime: v.number(),
    title: v.string(),
    userId: v.id("users"),
    model: v.string(),
    provider: v.string(),
    isActive: v.boolean(),
  })),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const createConversation = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    model: v.string(),
    provider: v.string(),
  },
  returns: v.id("conversations"),
  handler: async (ctx, args) => {
    // Set all other conversations to inactive
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_user_active", (q) => q.eq("userId", args.userId).eq("isActive", true))
      .collect();
    
    for (const conv of conversations) {
      await ctx.db.patch(conv._id, { isActive: false });
    }

    // Create new active conversation
    return await ctx.db.insert("conversations", {
      title: args.title,
      userId: args.userId,
      model: args.model,
      provider: args.provider,
      isActive: true,
    });
  },
});

export const setActiveConversation = mutation({
  args: {
    userId: v.id("users"),
    conversationId: v.id("conversations"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Set all conversations to inactive
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    for (const conv of conversations) {
      await ctx.db.patch(conv._id, { isActive: false });
    }

    // Set target conversation to active
    await ctx.db.patch(args.conversationId, { isActive: true });
    return null;
  },
});

export const updateConversationTitle = mutation({
  args: {
    conversationId: v.id("conversations"),
    title: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, { title: args.title });
    return null;
  },
});