"use client";

import { SignInForm } from "./sign-in-form";

// We're now using OAuth only, so this component is just a wrapper
// around SignInForm. Keeping it to avoid breaking any imports.
export function SignUpForm() {
  return <SignInForm />;
}
