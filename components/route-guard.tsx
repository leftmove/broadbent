"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { Loader } from "lucide-react"

interface RouteGuardProps {
  children: React.ReactNode
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/sign-in")
    }
  }, [session, isPending, router])

  if (isPending) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <div className="flex flex-col items-center justify-center gap-2">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return <>{children}</>
}