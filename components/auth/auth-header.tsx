import { ReactNode } from "react";

interface AuthHeaderProps {
  title?: string;
  logo?: ReactNode;
}

export function AuthHeader({ title = "Broadbent", logo }: AuthHeaderProps) {
  return (
    <div className="flex flex-col space-y-2 text-center">
      {logo}
      <h1 className="text-5xl font-semibold tracking-tight">{title}</h1>
      <p className="mb-24 text-md text-muted-foreground">
        Same chat, new interface.
      </p>
      {/* <p className="mt-0 text-md text-muted-foreground">
        Be really fucking productive.
      </p> */}
    </div>
  );
}
