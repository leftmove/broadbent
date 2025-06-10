"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { Input } from "components/ui/input";
import { Button } from "components/ui/button";
import { toast } from "sonner";
import { useAccounts } from "state/accounts";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Alert, AlertDescription } from "components/ui/alert";
import { AlertCircle, Github, Mail } from "lucide-react";

interface SignInFormProps {
  mode?: "signIn" | "addAccount";
  showLinks?: boolean;
}

export function SignInForm({
  mode = "signIn",
  showLinks = true,
}: SignInFormProps) {
  const { signIn } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const user = useQuery(api.auth.loggedInUser);
  const { syncWithAuthUser } = useAccounts();
  const [error, setError] = useState<string | null>(null);

  // Sync the current user with accounts system when user data changes
  useEffect(() => {
    // Only sync when we have a valid user and we're not in addAccount mode
    // This prevents the infinite loop when switching accounts
    if (user && mode === "signIn") {
      syncWithAuthUser({
        email: user.email || "",
        name: user.name,
        image: user.image,
      });
    }
  }, [user, syncWithAuthUser, mode]);

  const handleOAuthSignIn = async (provider: "github" | "google") => {
    setIsLoading(true);
    setActiveProvider(provider);
    setError(null);

    try {
      await signIn(provider);
      // The user effect will handle syncing the user with accounts once signed in
    } catch (error: any) {
      console.error(`${provider} sign in error:`, error);
      setError(`Failed to sign in with ${provider}. ${error.message || ""}`);
      toast.error(`Failed to sign in with ${provider}.`);
    } finally {
      setIsLoading(false);
      setActiveProvider(null);
    }
  };

  const title = mode === "signIn" ? "Sign In" : "Add Account";
  const subtitle =
    mode === "signIn"
      ? "Sign in with your preferred service"
      : "Add another account to switch between different identities";

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {error && (
        <Alert className="bg-destructive/10 border-destructive/20">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <AlertDescription className="text-destructive">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          className="w-full relative"
          onClick={() => void handleOAuthSignIn("github")}
          disabled={isLoading}
        >
          {activeProvider === "github" ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Signing in...
            </span>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-5 h-5 mr-2"
              >
                <path
                  fill="currentColor"
                  d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                />
              </svg>
              Continue with GitHub
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full relative"
          onClick={() => void handleOAuthSignIn("google")}
          disabled={isLoading}
        >
          {activeProvider === "google" ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Signing in...
            </span>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-5 h-5 mr-2"
              >
                <path
                  fill="currentColor"
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                />
              </svg>
              Continue with Google
            </>
          )}
        </Button>

        {/* Add explanatory note about OAuth */}
        <p className="text-xs text-center text-muted-foreground">
          We only support signing in with GitHub and Google accounts.
          {mode === "signIn" &&
            " Your account will be created automatically if you don't already have one."}
        </p>
      </div>
    </div>
  );
}
