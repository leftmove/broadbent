import { Model } from "./models";
import { type Message } from "./providers";

export interface Context {
  integrity: "strong" | "weak";
  remaining: number;
}

export function tokenizeRoughly(text: string) {
  return Math.ceil(text.length / 4);
}

export function determineContext(model: Model, messages: Message[]): Context {
  let integrity: Context["integrity"] = "strong";
  const maxContext = model.context.window;
  const usedContext = messages.reduce((acc, message) => {
    if (message.usage?.total) {
      return acc + message.usage.total;
    } else {
      integrity = "weak";
      return acc;
    }
  }, 0);
  return {
    integrity,
    remaining: maxContext - usedContext,
  };
}
