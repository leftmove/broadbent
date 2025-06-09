import { observable } from "@legendapp/state";

export interface SidebarState {
  isOpen: boolean;
  isMobile: boolean;
}

export const sidebarState = observable<SidebarState>({
  isOpen: true,
  isMobile: false,
});