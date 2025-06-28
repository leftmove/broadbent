import { createAuthClient } from "better-auth/client"
import type { Session, User } from "./auth"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
})

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  $Infer: { Session: SessionType, User: UserType },
} = authClient

export type { Session, User }