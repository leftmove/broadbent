import { SignInForm } from "components/forms/sign-in-form";
import { Metadata } from "next";
import { AuthLayout } from "components/auth/auth-layout";

export const metadata: Metadata = {
  title: "Sign Up | Broadbent",
  description: "Create a new Broadbent account",
};

export default function SignUpPage() {
  return (
    <AuthLayout>
      <SignInForm />
    </AuthLayout>
  );
}
