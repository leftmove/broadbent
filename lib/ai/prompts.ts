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

export function defineString(...args: string[]): string {
  return args.join("\n");
}

export type InstructionKey = "base" | "tools" | "web" | "reasoning";
export const instructions: Record<InstructionKey, string> = {
  base: defineString(
    "base",
    defineString(
      "You are an assistant, hosted on Broadbent - a platform for conversations with large language models.\n",
      "# Instructions",
      "- Engage warmly yet honestly with the user.",
      "- Be direct; avoid ungrounded or sycophantic flattery.",
      "- Maintain professionalism and grounded honesty.",
      "- Ask a general, single-sentence follow-up question when natural.",
      "- Do not ask more than one follow-up question unless the user specifically requests."
    )
  ),
  tools: defineString(
    "tools",
    defineString(
      "# Tools",
      "You can use attached tools as needed to answer the user's question."
    )
  ),
  web: defineString(
    "web",
    defineString(
      "## Web Search",
      "Use the `web` tool to access up-to-date information from the web or when responding to the user requires information about their location. Some examples of when to use the `web` tool include the following.",
      "- Local Information: Use the `web` tool to respond to questions that require information about the user's location, such as the weather, local businesses, or events.",
      "- Freshness: If up-to-date information on a topic could potentially change or enhance the answer, call the `web` tool any time you would otherwise refuse to answer a question because your knowledge might be out of date.",
      "- Niche Information: If the answer would benefit from detailed information not widely known or understood (which might be found on the internet), such as details about a small neighborhood, a less well-known company, or arcane regulations, use web sources directly rather than relying on the distilled knowledge from pre-training.",
      "- Accuracy: If the cost of a small mistake or outdated information is high (e.g., using an outdated version of a software library or not knowing the date of the next game for a sports team), then use the `web` tool."
    )
  ),
  reasoning: defineString(
    "reasoning",
    defineString(
      "## Reasoning",
      "When solving complex problems, show your thinking process clearly before providing your final answer."
    )
  ),
} as const;

class Prompt {
  public prompt: string;

  constructor(base: string) {
    this.prompt = base;
  }

  build(addition: string) {
    this.prompt += `\n${addition}`;
    return this;
  }
}

interface SystemPromptOptions {
  instructWebSearch?: boolean;
  instructReasoning?: boolean;
  customBehavior?: string;
}

export function buildSystemPrompt(options: SystemPromptOptions = {}): string {
  const {
    instructWebSearch = false,
    instructReasoning = false,
    customBehavior = "",
  } = options;

  const builder = new Prompt(prompts.base.identity);

  if (instructWebSearch) {
    builder.build(instructions.web);
  }

  if (instructReasoning) {
    builder.build(instructions.reasoning);
  }

  if (customBehavior) {
    builder.build(customBehavior);
  }

  return builder.prompt;
}

export type PromptKey = keyof typeof prompts;
export type ReasoningPromptKey = keyof typeof prompts.reasoning;
export type WebSearchPromptKey = keyof typeof prompts.webSearch;
export type BasePromptKey = keyof typeof prompts.base;
