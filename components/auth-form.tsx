"use client";

import { useEffect } from "react";
import { redirectToAuth } from "supertokens-auth-react";
import { Button } from "components/ui/button";

export function AuthForm() {
  const handleSignIn = () => {
    redirectToAuth();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Button 
          onClick={handleSignIn}
          className="w-full font-sans"
        >
          Sign In / Sign Up
        </Button>
      </div>
      <div className="text-center text-sm text-muted-foreground">
        <p>Secure authentication powered by SuperTokens</p>
        <p className="mt-2">Supports email/password and social login</p>
      </div>
    </div>
  );
}