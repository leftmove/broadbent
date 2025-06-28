import { query } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentUser = query({
  args: { userId: v.id("user") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("user")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});