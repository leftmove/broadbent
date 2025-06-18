import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

import { llms } from "../lib/ai/providers";

export const providersValidator = v.union(
  ...llms.providers.map((p) => v.literal(p.id))
);

export const modelIdsValidator = v.union(
  ...llms.providers.flatMap((p) => p.models).map((m) => v.literal(m.id))
);

const applicationTables = {
  chats: defineTable({
    slug: v.string(),
    title: v.string(),
    userId: v.id("users"),
    pinned: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_slug", ["slug"]),

  messages: defineTable({
    chatId: v.id("chats"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    userId: v.id("users"),
    thinking: v.optional(v.string()),
  }).index("by_chat", ["chatId"]),

  settings: defineTable({
    userId: v.id("users"),
    provider: providersValidator,
    selectedModel: modelIdsValidator,
  }).index("by_user", ["userId"]),

  apiKeys: defineTable({
    userId: v.id("users"),
    provider: providersValidator,
    keyValue: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_provider", ["userId", "provider"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
