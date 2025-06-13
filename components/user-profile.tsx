"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "components/ui/avatar";
import { LogOut, ChevronUp, Users, PlusCircle } from "lucide-react";
import { cn } from "lib/utils";
import { Button } from "components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAccounts } from "state/accounts";
import { toast } from "sonner";

interface UserProfileProps {
  collapsed?: boolean;
}

export function UserProfile({ collapsed = false }: UserProfileProps) {
  const user = useQuery(api.auth.loggedInUser);
  const { signOut } = useAuthActions();
  const [expanded, setExpanded] = useState(false);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);

  const { accounts, switchToAccount, isValidatingAccount } = useAccounts();

  // Prevent unnecessary re-renders with memoized handler functions
  const handleToggleExpand = () => setExpanded((prev) => !prev);

  const handleToggleAccountSwitcher = () => {
    setShowAccountSwitcher((prev) => !prev);
  };

  if (!user) {
    return null;
  }

  // Generate initials from name or email
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }

    if (email) {
      return email.substring(0, 2).toUpperCase();
    }

    return "U";
  };

  // Get name from user object or parse from email
  const getName = () => {
    if (user.name) return user.name;
    if (user.email) {
      const emailName = user.email.split("@")[0];
      // Convert to title case and replace dots/underscores with spaces
      return emailName
        .replace(/[._]/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
    }
    return "User";
  };

  // Get avatar from user object or use provider-specific avatar
  const getAvatar = () => {
    return user.image || null;
  };

  const handleSignOut = () => {
    void signOut();
  };

  const handleSwitchAccount = (accountId: string) => {
    switchToAccount(accountId);
    setShowAccountSwitcher(false);
    toast.success("Account switched successfully");

    // In a real app, this would navigate to a sign-in page or trigger an auth flow
    // For now, we just show a toast
  };

  // Get current account
  const currentAccount = accounts.find((account) => account.current) || {
    name: getName(),
    email: user.email || "",
    image: getAvatar(),
  };

  // Always render both versions, but using CSS to show/hide
  if (collapsed) {
    return (
      <div className="px-1 py-2 transition-all duration-150 ease-in-out">
        <button
          className="w-10 h-10 mx-auto rounded-full focus:outline-none"
          onClick={handleToggleExpand}
        >
          <Avatar className="w-10 h-10 border border-border">
            <AvatarImage
              src={currentAccount.image || ""}
              alt={currentAccount.name}
            />
            <AvatarFallback>
              {getInitials(currentAccount.name, currentAccount.email)}
            </AvatarFallback>
          </Avatar>
        </button>
      </div>
    );
  }

  return (
    <div className="px-2 py-2 transition-all duration-150 ease-in-out">
      <button
        onClick={handleToggleExpand}
        className="flex items-center w-full p-2 space-x-3 rounded-lg hover:bg-secondary/50 focus:outline-none"
      >
        <Avatar className="w-10 h-10 border border-border">
          <AvatarImage
            src={currentAccount.image || ""}
            alt={currentAccount.name}
          />
          <AvatarFallback>
            {getInitials(currentAccount.name, currentAccount.email)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden transition-all duration-150 ease-in-out">
          <p className="text-sm font-medium leading-none truncate">
            {currentAccount.name}
          </p>
          <p className="h-4 text-xs leading-none truncate text-muted-foreground">
            {currentAccount.email}
          </p>
        </div>
        <ChevronUp
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-150 ease-in-out",
            !expanded && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className="mt-2 space-y-1 overflow-hidden will-change-transform"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="justify-start w-full px-3 text-sm text-left"
              onClick={handleToggleAccountSwitcher}
            >
              <Users className="w-4 h-4 mr-2" />
              <span>Switch account</span>
              <ChevronUp
                className={cn(
                  "ml-auto h-4 w-4 text-muted-foreground transition-transform",
                  !showAccountSwitcher && "rotate-180"
                )}
              />
            </Button>

            <AnimatePresence>
              {showAccountSwitcher && (
                <motion.div
                  className="pl-2 ml-2 overflow-hidden border-l border-border will-change-transform"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                >
                  {isValidatingAccount ? (
                    <div className="flex justify-center py-2">
                      <div className="w-4 h-4 border-2 rounded-full animate-spin border-primary border-t-transparent"></div>
                    </div>
                  ) : (
                    <>
                      {accounts
                        .filter((account) => !account.current)
                        .map((account) => (
                          <Button
                            key={account.id}
                            variant="ghost"
                            size="sm"
                            className="justify-start w-full h-auto px-3 py-1 my-1 text-xs text-left"
                            onClick={() => handleSwitchAccount(account.id)}
                          >
                            <div className="flex flex-col items-start">
                              <span>{account.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {account.email}
                              </span>
                            </div>
                          </Button>
                        ))}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start w-full px-3 mt-1 text-xs text-left text-primary"
                        onClick={() =>
                          (window.location.href = "/settings/profile")
                        }
                      >
                        <PlusCircle className="w-3 h-3 mr-2" />
                        <span>Add another account</span>
                      </Button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="my-1 border-t border-border"></div>

            <Button
              variant="ghost"
              size="sm"
              className="justify-start w-full px-3 text-sm text-left text-destructive hover:bg-destructive/10 dark:text-red-400 dark:hover:bg-red-950/30"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span>Log out</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
