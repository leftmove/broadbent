import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    emailVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    tokenIdentifier: v.string(),
    supertokensUserId: v.optional(v.string()),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_supertokens_id", ["supertokensUserId"]),

  authSessions: defineTable({
    userId: v.id("users"),
    sessionHandle: v.string(),
    refreshTokenHash: v.string(),
    antiCsrfToken: v.optional(v.string()),
    publicData: v.optional(v.any()),
    sessionData: v.optional(v.any()),
  }).index("sessionHandle", ["sessionHandle"]),

  authAccounts: defineTable({
    userId: v.id("users"),
    provider: v.string(),
    providerAccountId: v.string(),
    refreshToken: v.optional(v.string()),
    accessToken: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    tokenType: v.optional(v.string()),
    scope: v.optional(v.string()),
    idToken: v.optional(v.string()),
    sessionState: v.optional(v.string()),
  })
    .index("providerAndAccountId", ["provider", "providerAccountId"])
    .index("userId", ["userId"]),

  authRefreshTokens: defineTable({
    sessionHandle: v.string(),
    refreshTokenHash: v.string(),
    expiresAt: v.number(),
  }).index("sessionHandle", ["sessionHandle"]),

  authVerificationCodes: defineTable({
    identifier: v.string(),
    code: v.string(),
    expiresAt: v.number(),
    attempts: v.number(),
  }).index("identifier", ["identifier"]),

  chats: defineTable({
    title: v.string(),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),

  messages: defineTable({
    chatId: v.id("chats"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    userId: v.id("users"),
  }).index("by_chat", ["chatId"]),

  settings: defineTable({
    userId: v.id("users"),
    provider: v.union(
      v.literal("openai"),
      v.literal("anthropic"),
      v.literal("google"),
      v.literal("grok"),
      v.literal("openrouter")
    ),
    selectedModel: v.optional(v.string()),
  }).index("by_user", ["userId"]),
});