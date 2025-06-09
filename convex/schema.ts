import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    avatar: v.optional(v.string()),
  }),

  conversations: defineTable({
    title: v.string(),
    userId: v.id("users"),
    model: v.string(),
    provider: v.string(),
    isActive: v.boolean(),
  }).index("by_user", ["userId"]).index("by_user_active", ["userId", "isActive"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    isStreaming: v.boolean(),
    timestamp: v.number(),
  }).index("by_conversation", ["conversationId"]).index("by_conversation_timestamp", ["conversationId", "timestamp"]),

  apiKeys: defineTable({
    userId: v.id("users"),
    provider: v.string(),
    keyHash: v.string(),
    isValid: v.boolean(),
  }).index("by_user_provider", ["userId", "provider"]),
});