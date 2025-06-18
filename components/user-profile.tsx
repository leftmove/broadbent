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
        <div className="relative group">
          <button
            className="w-10 h-10 mx-auto transition-all duration-200 rounded-full focus:outline-none hover:scale-105"
            onClick={handleToggleExpand}
          >
            <Avatar className="w-10 h-10 transition-all duration-200 border-2 shadow-sm border-border/50 hover:border-primary/40">
              <AvatarImage
                src={currentAccount.image || ""}
                alt={currentAccount.name}
              />
              <AvatarFallback className="text-sm font-medium bg-gradient-to-br from-primary/20 to-primary/40">
                {getInitials(currentAccount.name, currentAccount.email)}
              </AvatarFallback>
            </Avatar>
          </button>
          {/* Tooltip */}
          <div className="absolute z-50 px-2 py-1 ml-2 text-xs transition-opacity duration-200 -translate-y-1/2 rounded opacity-0 pointer-events-none left-full top-1/2 bg-foreground text-background group-hover:opacity-100 whitespace-nowrap">
            {currentAccount.name}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 py-2 transition-all duration-150 ease-in-out">
      <button
        onClick={handleToggleExpand}
        className="flex items-center w-full p-3 space-x-3 transition-all duration-200 border border-transparent rounded-lg hover:bg-secondary/60 focus:outline-none hover:border-secondary/40"
      >
        <Avatar className="w-10 h-10 border-2 shadow-sm border-border/50">
          <AvatarImage
            src={currentAccount.image || ""}
            alt={currentAccount.name}
          />
          <AvatarFallback className="text-sm font-medium bg-gradient-to-br from-primary/20 to-primary/40">
            {getInitials(currentAccount.name, currentAccount.email)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden transition-all duration-150 ease-in-out">
          <p className="text-sm font-medium leading-none truncate">
            {currentAccount.name}
          </p>
          <p className="h-4 mt-1 text-xs leading-none truncate text-muted-foreground">
            {currentAccount.email}
          </p>
        </div>
        <ChevronUp
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200 ease-in-out",
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
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="justify-start w-full px-3 text-sm text-left transition-all duration-200 border border-transparent h-9 hover:bg-secondary/60 hover:border-secondary/40"
              onClick={handleToggleAccountSwitcher}
            >
              <Users className="w-4 h-4 mr-2" />
              <span>Switch account</span>
              <ChevronUp
                className={cn(
                  "ml-auto h-4 w-4 text-muted-foreground transition-transform duration-200",
                  !showAccountSwitcher && "rotate-180"
                )}
              />
            </Button>

            <AnimatePresence>
              {showAccountSwitcher && (
                <motion.div
                  className="pl-3 ml-2 overflow-hidden overflow-y-auto border-l-2 border-border/60 will-change-transform max-h-32"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                >
                  {isValidatingAccount ? (
                    <div className="flex justify-center py-3">
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
                            className="justify-start w-full h-auto px-3 py-2 my-1 text-xs text-left transition-all duration-200 border border-transparent rounded-md hover:bg-secondary/60 hover:border-secondary/40"
                            onClick={() => handleSwitchAccount(account.id)}
                          >
                            <div className="flex flex-col items-start">
                              <span className="font-medium">
                                {account.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {account.email}
                              </span>
                            </div>
                          </Button>
                        ))}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start w-full px-3 mt-2 text-xs text-left transition-all duration-200 border border-transparent rounded-md text-primary hover:bg-primary/10 hover:border-primary/20"
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

            <div className="my-2 border-t border-border/60"></div>

            <Button
              variant="ghost"
              size="sm"
              className="justify-start w-full px-3 text-sm text-left transition-all duration-200 border border-transparent text-destructive hover:bg-destructive/10 dark:text-red-400 dark:hover:bg-red-950/30 hover:border-destructive/20 h-9"
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
