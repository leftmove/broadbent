import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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
  // Better Auth tables - these will be created by the adapter
  user: defineTable({
    name: v.string(),
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

  session: defineTable({
    id: v.string(),
    expiresAt: v.number(),
    token: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    userId: v.id("user"),
  })
    .index("by_id", ["id"])
    .index("by_user_id", ["userId"]),

  account: defineTable({
    id: v.string(),
    accountId: v.string(),
    providerId: v.string(),
    userId: v.id("user"),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    idToken: v.optional(v.string()),
    accessTokenExpiresAt: v.optional(v.number()),
    refreshTokenExpiresAt: v.optional(v.number()),
    scope: v.optional(v.string()),
    password: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_provider_account", ["providerId", "accountId"]),

  verification: defineTable({
    id: v.string(),
    identifier: v.string(),
    value: v.string(),
    expiresAt: v.number(),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_identifier", ["identifier"]),

  chats: defineTable({
    slug: v.string(),
    title: v.string(),
    userId: v.id("user"),
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
    userId: v.id("user"),
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
    userId: v.id("user"),
    provider: providersValidator,
    selectedModel: modelIdsValidator,
  }).index("by_user", ["userId"]),

  apiKeys: defineTable({
    userId: v.id("user"),
    provider: apiKeyProvidersValidator,
    keyValue: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_provider", ["userId", "provider"]),

  generations: defineTable({
    messageId: v.id("messages"),
    userId: v.id("user"),
    cancelled: v.boolean(),
    searching: v.optional(v.boolean()),
    error: v.optional(v.string()),
  })
    .index("by_message", ["messageId"])
    .index("by_user", ["userId"]),
};

export default defineSchema(applicationTables);