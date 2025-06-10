import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { toast } from "sonner";

export interface Account {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  current: boolean;
}

// Initialize accounts from localStorage or with current user if not present
const loadAccounts = (): Account[] => {
  if (typeof window === "undefined") return [];

  const savedAccounts = localStorage.getItem("broadbent-accounts");

  if (savedAccounts) {
    try {
      return JSON.parse(savedAccounts);
    } catch (e) {
      console.error("Failed to parse saved accounts:", e);
      return [];
    }
  }

  return [];
};

export const useAccounts = () => {
  const user = useQuery(api.auth.loggedInUser);
  const [accounts, setAccounts] = useState<Account[]>(loadAccounts());
  const [isValidatingAccount, setIsValidatingAccount] = useState(false);

  // Ensure current user is always in the accounts list
  useEffect(() => {
    if (!user) return;

    setAccounts((prevAccounts) => {
      // Check if current user is already in accounts
      const existingAccount = prevAccounts.find(
        (account) => account.email === user.email
      );

      if (existingAccount) {
        // Ensure the account is marked as current
        if (!existingAccount.current) {
          return prevAccounts.map((account) => ({
            ...account,
            current: account.email === user.email,
          }));
        }
        return prevAccounts;
      }

      // Add current user to accounts
      const newAccount: Account = {
        id: user._id,
        name:
          user.name ||
          user.email
            ?.split("@")[0]
            .replace(/[._]/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()) ||
          "User",
        email: user.email || "",
        image: user.image,
        current: true,
      };

      // Reset all accounts to non-current and set new account as current
      const updatedAccounts = prevAccounts.map((account) => ({
        ...account,
        current: false,
      }));

      return [newAccount, ...updatedAccounts];
    });
  }, [user]);

  // Save accounts to localStorage when they change
  useEffect(() => {
    if (accounts.length > 0 && typeof window !== "undefined") {
      localStorage.setItem("broadbent-accounts", JSON.stringify(accounts));
    }
  }, [accounts]);

  const addAccount = (account: Omit<Account, "id" | "current">) => {
    // Check if account already exists
    const existingAccount = accounts.find((a) => a.email === account.email);

    if (existingAccount) {
      // If trying to add an existing account, just switch to it
      switchToAccount(existingAccount.id);
      return;
    }

    const newAccount: Account = {
      id: `account-${Date.now()}`,
      ...account,
      current: false,
    };

    setAccounts((prevAccounts) => [...prevAccounts, newAccount]);
  };

  const removeAccount = (accountId: string) => {
    setAccounts((prevAccounts) =>
      prevAccounts.filter((account) => account.id !== accountId)
    );
  };

  const switchToAccount = (accountId: string) => {
    // In a real app, this would log out the current user and log in as the selected user
    // For now, we'll just mark it as current

    // First verify this is a valid account id
    const accountToSwitch = accounts.find(
      (account) => account.id === accountId
    );

    if (!accountToSwitch) {
      toast.error("Cannot switch to account: Account not found");
      return;
    }

    setIsValidatingAccount(true);

    // Simulate verification process with a delay
    setTimeout(() => {
      setAccounts((prevAccounts) =>
        prevAccounts.map((account) => ({
          ...account,
          current: account.id === accountId,
        }))
      );
      setIsValidatingAccount(false);
      toast.success(`Switched to ${accountToSwitch.email}`);
    }, 600);
  };

  // Add method to sync with authenticated user
  const syncWithAuthUser = (userData: {
    email: string;
    name?: string;
    image?: string;
  }) => {
    // Prevent unnecessary updates that might cause loops
    if (!userData.email) return;

    // This would be called when a user successfully authenticates
    // In a real app, this would also handle tokens, etc.
    const existingAccount = accounts.find(
      (account) => account.email === userData.email
    );

    // Check if the account is already current to prevent unnecessary updates
    if (existingAccount && existingAccount.current) {
      // Only update if there's new data to sync
      const needsUpdate =
        (userData.name && userData.name !== existingAccount.name) ||
        (userData.image && userData.image !== existingAccount.image);

      if (needsUpdate) {
        setAccounts((prevAccounts) =>
          prevAccounts.map((account) =>
            account.email === userData.email
              ? {
                  ...account,
                  name: userData.name || account.name,
                  image: userData.image || account.image,
                }
              : account
          )
        );
      }

      return;
    }

    if (existingAccount) {
      // Update existing account with any new info and make it current
      setAccounts((prevAccounts) =>
        prevAccounts.map((account) => ({
          ...account,
          ...(account.email === userData.email
            ? {
                name: userData.name || account.name,
                image: userData.image || account.image,
                current: true,
              }
            : { current: false }),
        }))
      );
    } else {
      // Add as new account and make it current
      const newAccount: Account = {
        id: `account-${Date.now()}`,
        name:
          userData.name ||
          userData.email
            .split("@")[0]
            .replace(/[._]/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
        email: userData.email,
        image: userData.image,
        current: true,
      };

      setAccounts((prevAccounts) =>
        prevAccounts
          .map((account) => ({
            ...account,
            current: false,
          }))
          .concat(newAccount)
      );
    }
  };

  return {
    accounts,
    addAccount,
    removeAccount,
    switchToAccount,
    syncWithAuthUser,
    isValidatingAccount,
  };
};
