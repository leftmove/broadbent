import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

import { providersValidator, modelIdsValidator } from "./schema";

export const getProvider = query({
  args: { userId: v.id("users") },
  returns: v.union(providersValidator, v.null()),
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
  returns: v.union(modelIdsValidator, v.null()),
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
    provider: providersValidator,
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
        provider: "openai",
        selectedModel: "gpt-4o",
      });
    }
    return null;
  },
});

export const setSelectedModel = mutation({
  args: {
    userId: v.id("users"),
    provider: providersValidator,
    modelId: modelIdsValidator,
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
      provider: providersValidator,
      selectedModel: v.union(modelIdsValidator, v.null()),
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

export const getAllApiKeys = query({
  args: { userId: v.id("users") },
  returns: v.object({
    openai: v.optional(v.string()),
    anthropic: v.optional(v.string()),
    google: v.optional(v.string()),
    xai: v.optional(v.string()),
    groq: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const apiKeys = await ctx.db
      .query("apiKeys")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const result: Record<string, string> = {};
    for (const apiKey of apiKeys) {
      result[apiKey.provider] = apiKey.keyValue;
    }

    return {
      openai: result.openai || "",
      anthropic: result.anthropic || "",
      google: result.google || "",
      xai: result.xai || "",
      groq: result.groq || "",
    };
  },
});
