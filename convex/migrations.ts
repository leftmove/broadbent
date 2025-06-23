import { Migrations } from "@convex-dev/migrations";

// Initialize migrations without components for now - they'll be injected at runtime
export const migrations = new Migrations({});

// Migration 1: Rename 'thinking' field to 'total' in messages.usage
export const renameUsageThinkingToTotal = migrations.define({
  table: "messages",
  migrateOne: async (ctx, message: any) => {
    // Only migrate if the message has usage data with a thinking field
    if (
      message.usage &&
      typeof message.usage === "object" &&
      "thinking" in message.usage
    ) {
      const oldUsage = message.usage;
      const newUsage = {
        prompt: oldUsage.prompt,
        completion: oldUsage.completion,
        total: oldUsage.totalTokens, // Rename thinking to total
      };

      await ctx.db.patch(message._id, {
        usage: newUsage,
      });
    }
  },
});

// Migration 2: Add 'searching' field to generations table
export const addSearchingToGenerations = migrations.define({
  table: "generations",
  migrateOne: async (ctx, generation: any) => {
    // Add the searching field if it doesn't exist
    await ctx.db.patch(generation._id, {
      searching: false, // Default to false
    });
  },
});

// General purpose runner
export const run = migrations.runner();
