import { observable } from "@legendapp/state";

export interface User {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface UserState {
  currentUser: User | null;
  apiKeys: Record<string, string>; // provider -> key
}

export const userState = observable<UserState>({
  currentUser: null,
  apiKeys: {},
});