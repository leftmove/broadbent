"use client"

import { ReactNode } from "react"

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Better Auth doesn't need a provider wrapper like Convex Auth
  // The auth client handles everything internally
  return <>{children}</>
}