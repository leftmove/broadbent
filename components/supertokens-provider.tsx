"use client";

import React from "react";
import { SuperTokensWrapper } from "supertokens-auth-react";
import { frontendConfig } from "lib/supertokens/config";

if (typeof window !== "undefined") {
  // Only run on client side
  require("supertokens-auth-react/lib/build/styles.css");
}

export function SuperTokensProvider({ children }: { children: React.ReactNode }) {
  return (
    <SuperTokensWrapper config={frontendConfig()}>
      {children}
    </SuperTokensWrapper>
  );
}