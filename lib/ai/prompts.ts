export const prompts = {
  reasoning: {
    instructions: `\n\nPlease show your reasoning process by thinking through this step by step within <think></think> tags before providing your final answer.`,
  },

  webSearch: {
    anthropicInstructions: `\n\nIMPORTANT: You have access to a web search tool. If this question requires current information, recent events, or data that might not be in your training data, please use the webSearch tool to find the most up-to-date information before responding.`,

    systemMessage: `You have access to a webSearch tool that can search the internet for current information. Use this tool when:
- The user asks about recent events, current news, or real-time data
- You need information that might have changed since your training cutoff
- The question involves current prices, stocks, weather, or other time-sensitive information
- The user explicitly asks you to search for something

Always call the webSearch tool BEFORE responding if the question requires current information.`,
  },

  base: {
    identity: `You are a helpful AI assistant.`,
    behavior: `Provide accurate, helpful, and concise responses to user questions.`,
    reasoning: `When solving complex problems, show your thinking process clearly before providing your final answer.`,
    webSearch: `Use web search when you need current information that may not be in your training data.`,
  },
};

interface SystemPromptOptions {
  hasReasoning?: boolean;
  hasWebSearch?: boolean;
  customBehavior?: string;
}

export function buildSystemPrompt(options: SystemPromptOptions = {}): string {
  const {
    hasReasoning = false,
    hasWebSearch = false,
    customBehavior,
  } = options;

  let prompt = prompts.base.identity;

  // Add capabilities
  const capabilities: string[] = [];
  if (hasReasoning) {
    capabilities.push("advanced reasoning capabilities");
  }
  if (hasWebSearch) {
    capabilities.push("access to real-time web search");
  }

  if (capabilities.length > 0) {
    prompt += ` with ${capabilities.join(" and ")}`;
  }

  prompt += ".";

  // Add specific behaviors
  const behaviors: string[] = [];

  if (customBehavior) {
    behaviors.push(customBehavior);
  } else {
    behaviors.push(prompts.base.behavior);
  }

  if (hasReasoning) {
    behaviors.push(prompts.base.reasoning);
  }

  if (hasWebSearch) {
    behaviors.push(prompts.base.webSearch);
  }

  if (behaviors.length > 0) {
    prompt += ` ${behaviors.join(" ")}`;
  }

  return prompt;
}

export type PromptKey = keyof typeof prompts;
export type ReasoningPromptKey = keyof typeof prompts.reasoning;
export type WebSearchPromptKey = keyof typeof prompts.webSearch;
export type BasePromptKey = keyof typeof prompts.base;
