"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useSessionContext } from "supertokens-auth-react/recipe/session";

const ThirdPartyEmailPasswordAuthNoSSR = dynamic(
  () => import("supertokens-auth-react/recipe/thirdpartyemailpassword").then((mod) => mod.ThirdPartyEmailPasswordAuth),
  { ssr: false }
);

export default function AuthPage() {
  const router = useRouter();
  const session = useSessionContext();

  useEffect(() => {
    if (session.loading === false && session.doesSessionExist) {
      router.push("/");
    }
  }, [session, router]);

  if (session.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to Broadbent</h1>
          <p className="text-muted-foreground">Sign in to continue to your AI chat</p>
        </div>
        <ThirdPartyEmailPasswordAuthNoSSR />
      </div>
    </div>
  );
}