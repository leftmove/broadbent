"use client";

import Link from "next/link";
import { Button } from "components/ui/button";
import { Alert, AlertDescription } from "components/ui/alert";
import { AlertCircle } from "lucide-react";

export function ResetPasswordForm() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Password Reset Not Available
        </h1>
        <p className="text-sm text-muted-foreground">
          We now only support signing in with GitHub and Google accounts.
        </p>
      </div>

      <Alert className="bg-blue-500/10 border-blue-500/30">
        <AlertCircle className="w-4 h-4 text-blue-500" />
        <AlertDescription className="text-blue-600 dark:text-blue-400">
          Password-based authentication has been removed. Please use GitHub or
          Google to sign in.
        </AlertDescription>
      </Alert>

      <div className="flex justify-center">
        <Link href="/auth/sign-in">
          <Button>Return to Sign In</Button>
        </Link>
      </div>
    </div>
  );
}
