import { KeyboardError } from "lib/errors";

type Key = "enter" | "shift" | "escape" | "tab";

export class Keyboard {
  shortcuts: {
    keys: Key[];
    action: () => void;
  }[];

  constructor() {
    this.shortcuts = [];
  }

  setup(keys: string[], action: () => void) {
    if (this.shortcuts.find((s) => s.keys === keys)) {
      throw new KeyboardError("Shortcut already exists.");
    } else {
      this.shortcuts.push({
        keys: keys.map((k) => k as Key),
        action,
      });
    }

    return this;
  }

  handler(): (e: React.KeyboardEvent<HTMLTextAreaElement>) => void {
    return (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      this.shortcuts.forEach((shortcut) => {
        const conditions = shortcut.keys.map((key) => {
          switch (key) {
            case "enter":
              return e.key === "Enter";
            case "shift":
              return e.shiftKey;
            case "escape":
              return e.key === "Escape";
            case "tab":
              return e.key === "Tab";
          }
        });
        const met = conditions.every((k) => k);

        if (met) {
          shortcut.action();
        }
      });
    };
  }
}
