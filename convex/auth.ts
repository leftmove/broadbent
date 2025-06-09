import { convexAuth } from "@convex-dev/auth/server";
import { query } from "./_generated/server";
import { v } from "convex/values";

// Custom SuperTokens auth provider
const SuperTokens = {
  id: "supertokens",
  async getUserInfo(ctx: any, tokenInfo: { accessToken: string }) {
    // Verify the SuperTokens session token
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/session/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenInfo.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Invalid SuperTokens session");
    }

    const sessionData = await response.json();
    
    return {
      userId: sessionData.userId,
      email: sessionData.email,
      name: sessionData.name,
    };
  },
};

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [SuperTokens],
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    return user;
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});