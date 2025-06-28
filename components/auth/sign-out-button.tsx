"use client"

import { signOut } from "@/lib/auth-client"
import { Button } from "components/ui/button"
import { LogOut } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed out successfully")
          },
        },
      })
    } catch (error) {
      console.error("Sign out error:", error)
      toast.error("Failed to sign out")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => void handleSignOut()}
      disabled={isLoading}
      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
    >
      <LogOut className="h-4 w-4" />
      <span>Sign out</span>
    </Button>
  )
}