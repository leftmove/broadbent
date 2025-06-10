import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
// import { Password } from "@convex-dev/auth/providers/Password";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { query } from "./_generated/server";

// Keep these imports commented out for potential future use
// import { ResendOTPPasswordReset } from "./password-reset";
// import { ResendOTP } from "./otp";

import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
// import Resend from "@auth/core/providers/resend";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    // Password({ reset: ResendOTPPasswordReset, verify: ResendOTP }),
    Anonymous,
    GitHub,
    Google,
    // Resend,
  ],
});

export const loggedInUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return user;
  },
});
