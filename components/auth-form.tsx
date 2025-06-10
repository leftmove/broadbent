"use client";

import { useState } from "react";
import { SignInForm } from "components/forms/sign-in-form";
import { SignUpForm } from "components/forms/sign-up-form";

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);

  return isSignUp ? (
    <div className="space-y-4">
      <SignUpForm />
      <div className="text-center text-sm">
        <button
          className="underline underline-offset-4 hover:text-primary"
          onClick={() => setIsSignUp(false)}
        >
          Already have an account? Sign In
        </button>
      </div>
    </div>
  ) : (
    <div className="space-y-4">
      <SignInForm />
      <div className="text-center text-sm">
        <button
          className="underline underline-offset-4 hover:text-primary"
          onClick={() => setIsSignUp(true)}
        >
          Need an account? Sign Up
        </button>
      </div>
    </div>
  );
}
