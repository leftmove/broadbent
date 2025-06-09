import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useObservable } from "@legendapp/state/react";
import { userState } from "state/functionality/user";
import { Storage } from "lib/utils/storage";
import { useEffect } from "react";

export function useUser() {
  const user = useObservable(userState);
  const createUser = useMutation(api.users.createUser);

  useEffect(() => {
    // Load user data from storage on mount
    const savedApiKeys = Storage.get('API_KEYS');
    if (savedApiKeys) {
      userState.apiKeys.set(savedApiKeys);
    }

    // Create a default user if none exists
    if (!user.currentUser.get()) {
      createDefaultUser();
    }
  }, []);

  const createDefaultUser = async () => {
    try {
      const userId = await createUser({
        name: "User",
        email: undefined,
        avatar: undefined,
      });

      userState.currentUser.set({
        _id: userId,
        name: "User",
      });
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const setApiKey = (provider: string, key: string) => {
    const currentKeys = userState.apiKeys.get();
    userState.apiKeys.set({ ...currentKeys, [provider]: key });
    Storage.set('API_KEYS', userState.apiKeys.get());
  };

  const removeApiKey = (provider: string) => {
    const currentKeys = userState.apiKeys.get();
    const { [provider]: removed, ...rest } = currentKeys;
    userState.apiKeys.set(rest);
    Storage.set('API_KEYS', userState.apiKeys.get());
  };

  const updateUserProfile = (updates: { name?: string; email?: string; avatar?: string }) => {
    if (user.currentUser.get()) {
      Object.assign(userState.currentUser, updates);
    }
  };

  return {
    currentUser: user.currentUser,
    apiKeys: user.apiKeys,
    setApiKey,
    removeApiKey,
    updateUserProfile,
  };
}