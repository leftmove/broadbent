import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("generations", {
      messageId: args.messageId,
      userId: args.userId,
      cancelled: false,
    });
  },
});

export const cancel = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const generation = await ctx.db
      .query("generations")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .first();
    
    if (generation) {
      await ctx.db.patch(generation._id, { cancelled: true });
    }
  },
});

export const isCancelled = query({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const generation = await ctx.db
      .query("generations")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .first();
    
    return generation?.cancelled ?? false;
  },
});

export const cleanup = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const generation = await ctx.db
      .query("generations")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .first();
    
    if (generation) {
      await ctx.db.delete(generation._id);
    }
  },
});

export const isGenerating = query({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const generation = await ctx.db
      .query("generations")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .first();
    
    return !!generation;
  },
});