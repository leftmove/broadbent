import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

import {
  AIProvider,
  availableProviders,
  availableModels,
} from "../lib/ai/providers";

export const providers = v.union(
  ...availableProviders.map((provider: AIProvider) => v.literal(provider))
);
export const modelIds = v.union(
  ...availableModels.map((model: string) => v.literal(model))
);

const applicationTables = {
  chats: defineTable({
    title: v.string(),
    userId: v.id("users"),
    pinned: v.optional(v.boolean()),
  }).index("by_user", ["userId"]),

  messages: defineTable({
    chatId: v.id("chats"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    userId: v.id("users"),
  }).index("by_chat", ["chatId"]),

  settings: defineTable({
    userId: v.id("users"),
    provider: providers,
    selectedModel: v.optional(modelIds),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
