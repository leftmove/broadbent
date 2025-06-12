import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

import { providers, modelIds } from "./schema";

export const getProvider = query({
  args: { userId: v.id("users") },
  returns: v.union(providers, v.null()),
  handler: async (ctx, args) => {
    const pref = await ctx.db
      .query("settings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!pref) return null;
    const provider = pref.provider;
    return provider;
  },
});

export const getSelectedModel = query({
  args: { userId: v.id("users") },
  returns: v.union(modelIds, v.null()),
  handler: async (ctx, args) => {
    const pref = await ctx.db
      .query("settings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    return pref?.selectedModel || null;
  },
});

export const setProvider = mutation({
  args: {
    userId: v.id("users"),
    provider: providers,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { provider: args.provider });
    } else {
      await ctx.db.insert("settings", {
        userId: args.userId,
        provider: args.provider,
      });
    }
    return null;
  },
});

export const setSelectedModel = mutation({
  args: {
    userId: v.id("users"),
    provider: providers,
    modelId: modelIds,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { selectedModel: args.modelId });
    } else {
      await ctx.db.insert("settings", {
        userId: args.userId,
        provider: "openai", // Default provider if creating new settings
        selectedModel: args.modelId,
      });
    }
    return null;
  },
});

export const getSettings = query({
  args: { userId: v.id("users") },
  returns: v.union(
    v.object({
      provider: providers,
      selectedModel: v.union(modelIds, v.null()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const pref = await ctx.db
      .query("settings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!pref) return null;

    const provider = pref.provider;
    return {
      provider,
      selectedModel: pref.selectedModel || null,
    };
  },
});
