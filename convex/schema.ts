import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

import { llms } from "../lib/ai/providers";

export const providersValidator = v.union(
  ...llms.providers.map((p) => v.literal(p.id))
);

export const modelIdsValidator = v.union(
  ...llms.providers.flatMap((p) => p.models).map((m) => v.literal(m.id)),
  v.string()
);

export const apiKeyProvidersValidator = v.union(
  ...llms.providers.map((p) => v.literal(p.id)),
  v.literal("firecrawl")
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
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system")
    ),
    type: v.optional(v.union(v.literal("error"), v.literal("normal"))),
    userId: v.id("users"),
    thinking: v.optional(v.string()),
    modelId: v.optional(v.string()),
    tools: v.optional(
      v.array(
        v.union(
          v.object({
            type: v.literal("tool_call"),
            toolCallId: v.string(),
            toolName: v.string(),
            args: v.any(),
          }),
          v.object({
            type: v.literal("tool_result"),
            toolCallId: v.string(),
            toolName: v.string(),
            result: v.any(),
          })
        )
      )
    ),
    sources: v.optional(
      v.array(
        v.object({
          title: v.string(),
          url: v.string(),
          excerpt: v.optional(v.string()),
        })
      )
    ),
    usage: v.optional(
      v.object({
        prompt: v.optional(v.number()),
        completion: v.optional(v.number()),
        total: v.optional(v.number()),
        promptTokens: v.optional(v.number()),
        completionTokens: v.optional(v.number()),
        totalTokens: v.optional(v.number()),
      })
    ),
  })
    .index("by_chat", ["chatId"])
    .searchIndex("search_messages", {
      searchField: "content",
      filterFields: ["role", "type"],
    }),

  settings: defineTable({
    userId: v.id("users"),
    provider: providersValidator,
    selectedModel: modelIdsValidator,
  }).index("by_user", ["userId"]),

  apiKeys: defineTable({
    userId: v.id("users"),
    provider: apiKeyProvidersValidator,
    keyValue: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_provider", ["userId", "provider"]),

  generations: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    cancelled: v.boolean(),
    searching: v.optional(v.boolean()),
    error: v.optional(v.string()),
  })
    .index("by_message", ["messageId"])
    .index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
