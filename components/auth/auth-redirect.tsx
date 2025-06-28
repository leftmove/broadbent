"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"

export function AuthRedirect() {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isPending && session) {
      router.push("/")
    }
  }, [session, isPending, router])

  return null
}