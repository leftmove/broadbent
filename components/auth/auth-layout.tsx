"use client";

import { ReactNode } from "react";
import { AuthHeader } from "./auth-header";
import { AuthRedirect } from "@/components/auth/auth-redirect";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="container flex flex-col items-center justify-center w-screen h-screen">
      <AuthRedirect />
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <AuthHeader />
        <div className="grid gap-6">{children}</div>
      </div>
    </div>
  );
}
