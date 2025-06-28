import { betterAuth } from "better-auth"
import { convexAdapter } from "@better-auth/convex-adapter"

export const auth = betterAuth({
  database: convexAdapter({
    convexUrl: process.env.CONVEX_URL!,
  }),
  emailAndPassword: {
    enabled: false, // Disable email/password auth as you're using OAuth only
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.User