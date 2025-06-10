import { SignInForm } from "components/forms/sign-in-form";
import { Metadata } from "next";
import { AuthLayout } from "components/auth/auth-layout";

export const metadata: Metadata = {
  title: "Sign In | Broadbent",
  description: "Sign in to your Broadbent account",
};

export default function SignInPage() {
  return (
    <AuthLayout>
      <SignInForm />
    </AuthLayout>
  );
}
