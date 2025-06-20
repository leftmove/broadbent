import { action, ActionCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";

import { streamText, ToolSet } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createXai } from "@ai-sdk/xai";
import { createGroq } from "@ai-sdk/groq";

import { createWebSearchTool } from "../lib/tools/web-search";

import { llms } from "../lib/ai/providers";
import { buildSystemPrompt } from "../lib/ai/prompts";
import { handleError, ErrorDetails } from "../lib/handlers";
import { modelIdsValidator } from "./schema";
import { api } from "./_generated/api";
import { ConvexError, CustomError } from "../lib/errors";
import { type ModelId } from "../lib/ai/models";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface Source {
  title: string;
  url: string;
  excerpt?: string;
}

interface StreamConfig {
  ctx: ActionCtx;
  chatSlug: string;
  messageSlug: Id<"messages">;
  isReasoningModel: boolean;
  selectedProvider: string;
}

function stripThinkTags(text: string): string {
  return text.replace(/<think>|<\/think>/g, "").trim();
}

function extractThinkingFromText(text: string): string {
  const thinkMatch = text.match(/<think>([\s\S]*?)(?:<\/think>|$)/);
  return thinkMatch ? thinkMatch[1].trim() : "";
}

async function throwError(
  ctx: ActionCtx,
  name: string,
  message: string,
  details: ErrorDetails,
  chatSlug: Id<"chats"> | string,
  messageSlug: Id<"messages"> | string
) {
  const customError = new CustomError(name, message, details);
  const errorMessage = handleError(customError, details);
  await ctx.runMutation(api.messages.updateBySlug, {
    chatSlug,
    messageSlug: messageSlug as Id<"messages">,
    content: errorMessage,
    type: "error",
  });
  return { content: errorMessage };
}

function createModelInstance(
  provider: string,
  apiKey: string,
  selectedModel: any
) {
  let llm;
  let model;

  switch (provider) {
    case "openai":
      llm = createOpenAI({ apiKey });
      model = llm(selectedModel.id);
      break;
    case "anthropic":
      llm = createAnthropic({ apiKey });
      model = llm(selectedModel.id, { sendReasoning: true });
      break;
    case "google":
      llm = createGoogleGenerativeAI({ apiKey });
      model = llm(selectedModel.id);
      break;
    case "xai":
      llm = createXai({ apiKey });
      model = llm(selectedModel.id);
      break;
    case "groq":
      llm = createGroq({ apiKey });
      model = llm(selectedModel.id);
      break;
    default:
      throw new Error(`Invalid provider: ${provider}`);
  }

  return model;
}

async function configureTools(
  apiKeys: Record<string, string>,
  hasToolSupport: boolean,
  webSearchTool: boolean,
  ctx: ActionCtx,
  chatSlug: Id<"chats"> | string,
  messageSlug: Id<"messages"> | string
): Promise<ToolSet | undefined> {
  if (!hasToolSupport) return undefined;

  const tools: ToolSet = {};

  if (webSearchTool) {
    if ("firecrawl" in apiKeys === false) {
      await throwError(
        ctx,
        "EmptyAPIKey",
        "API key not set with selected provider.",
        {
          provider: "firecrawl",
        },
        chatSlug,
        messageSlug
      );
    } else {
      tools.web = createWebSearchTool(apiKeys.firecrawl);
    }
  }

  return tools;
}

function prepareMessages(
  prompt: string,
  messageHistory: Message[] | undefined,
  selectedProvider: string,
  instructWebSearch: boolean,
  instructReasoning: boolean
): Message[] {
  const messages: Message[] = [];

  const systemMessage = buildSystemPrompt({
    instructWebSearch,
    instructReasoning,
  });

  messages.push({
    role: "system",
    content: systemMessage,
  });
  messages.push(...(messageHistory || []));
  messages.push({
    role: "user",
    content: prompt,
  });

  return messages;
}

async function checkCancellation(
  ctx: ActionCtx,
  messageSlug: Id<"messages">,
  chatSlug: string,
  selectedProvider: string,
  modelId: string
) {
  const isCancelled = await ctx.runQuery(api.generations.isCancelled, {
    messageId: messageSlug,
  });

  if (isCancelled) {
    await ctx.runMutation(api.generations.cleanup, {
      messageId: messageSlug,
    });
    return await throwError(
      ctx,
      "GenerationCancelled",
      "Generation was cancelled by user.",
      {
        provider: selectedProvider,
        model: modelId,
      },
      chatSlug,
      messageSlug
    );
  }

  return null;
}

async function handleStreamChunk(
  chunk: any,
  config: StreamConfig,
  state: {
    fullText: string;
    fullThinking: string;
    collectedSources: Source[];
  },
  modelId: string
) {
  const { ctx, chatSlug, messageSlug, isReasoningModel, selectedProvider } =
    config;

  const cancellationResult = await checkCancellation(
    ctx,
    messageSlug,
    chatSlug,
    selectedProvider,
    modelId
  );
  if (cancellationResult) return cancellationResult;

  if (chunk.type === "text-delta") {
    state.fullText += chunk.textDelta;
    if (isReasoningModel) {
      const extractedThinking = extractThinkingFromText(state.fullText);
      if (extractedThinking && extractedThinking !== state.fullThinking) {
        state.fullThinking = extractedThinking;
      }

      await ctx.runMutation(api.messages.updateBySlug, {
        chatSlug,
        messageSlug,
        content: stripThinkTags(state.fullText),
        thinking: state.fullThinking || undefined,
      });
    } else {
      await ctx.runMutation(api.messages.updateBySlug, {
        chatSlug,
        messageSlug,
        content: state.fullText,
      });
    }
  } else if (chunk.type === "reasoning") {
    if (chunk.textDelta) {
      state.fullThinking += chunk.textDelta;
      await ctx.runMutation(api.messages.updateBySlug, {
        chatSlug,
        messageSlug,
        content: state.fullText,
        thinking: stripThinkTags(state.fullThinking),
      });
    }
  } else if (chunk.type === "step-finish") {
    if (chunk.providerMetadata?.openai?.reasoning) {
      const reasoning = chunk.providerMetadata.openai.reasoning;
      if (typeof reasoning === "string") {
        state.fullThinking = reasoning;
        await ctx.runMutation(api.messages.updateBySlug, {
          chatSlug,
          messageSlug,
          content: stripThinkTags(state.fullText),
          thinking: state.fullThinking,
        });
      }
    } else if (chunk?.providerMetadata?.reasoning && !state.fullThinking) {
      const reasoning = chunk.providerMetadata.reasoning;
      if (typeof reasoning === "string") {
        state.fullThinking = stripThinkTags(reasoning);
        await ctx.runMutation(api.messages.updateBySlug, {
          chatSlug,
          messageSlug,
          content: stripThinkTags(state.fullText),
          thinking: state.fullThinking,
        });
      }
    }
  }
  // } else if (chunk.type === "tool-result") {
  //   if (chunk.toolName === "web" && chunk.result) {
  //     console.log(chunk.result);
  //   }
  // }

  return null;
}

async function extractFinalSources(
  result: any,
  collectedSources: Source[]
): Promise<Source[] | undefined> {
  const resultSources = await result.sources;
  if (resultSources && resultSources.length > 0) {
    return resultSources
      .filter((source: any) => source.sourceType === "url")
      .map((source: any) => ({
        title: source.title || "Web Source",
        url: source.url,
        excerpt:
          source.providerMetadata?.excerpt ||
          source.providerMetadata?.snippet ||
          "No excerpt available",
      }));
  } else if (collectedSources.length > 0) {
    return collectedSources;
  }
  return undefined;
}

async function processStream(
  result: any,
  config: StreamConfig,
  modelId: string
) {
  const state = {
    fullText: "",
    fullThinking: "",
    collectedSources: [] as Source[],
  };

  for await (const chunk of result.fullStream) {
    const chunkResult = await handleStreamChunk(chunk, config, state, modelId);
    if (chunkResult) return chunkResult; // Early return for cancellation
  }

  // Extract and update final sources
  const sources = await extractFinalSources(result, state.collectedSources);

  if (sources) {
    const updateData: any = {
      chatSlug: config.chatSlug,
      messageSlug: config.messageSlug,
      content: config.isReasoningModel
        ? stripThinkTags(state.fullText)
        : state.fullText,
      sources,
    };

    if (config.isReasoningModel) {
      updateData.thinking = state.fullThinking || undefined;
    }

    await config.ctx.runMutation(api.messages.updateBySlug, updateData);
  }

  // Clean up generation record on success
  await config.ctx.runMutation(api.generations.cleanup, {
    messageId: config.messageSlug,
  });

  const returnData: any = {
    content: config.isReasoningModel
      ? stripThinkTags(state.fullText)
      : state.fullText,
    sources,
  };

  if (config.isReasoningModel) {
    returnData.thinking = state.fullThinking || undefined;
  }

  return returnData;
}

export const generateResponse = action({
  args: {
    userId: v.id("users"),
    chatSlug: v.string(),
    messageSlug: v.id("messages"),
    prompt: v.string(),
    modelId: modelIdsValidator,
    messageHistory: v.optional(
      v.array(
        v.object({
          role: v.union(
            v.literal("user"),
            v.literal("assistant"),
            v.literal("system")
          ),
          content: v.string(),
        })
      )
    ),
    enableWebSearch: v.optional(v.boolean()),
  },
  returns: v.object({
    content: v.string(),
    thinking: v.optional(v.string()),
    sources: v.optional(
      v.array(
        v.object({
          title: v.string(),
          url: v.string(),
          excerpt: v.optional(v.string()),
        })
      )
    ),
  }),
  handler: async (ctx, args) => {
    await ctx.runMutation(api.generations.create, {
      messageId: args.messageSlug,
      userId: args.userId,
    });

    const apiKeys = await ctx.runQuery(api.settings.getAllApiKeys, {
      userId: args.userId,
    });
    const selectedModel = llms.model(args.modelId as ModelId);
    const selectedProvider = selectedModel.provider;

    if (!(selectedProvider in apiKeys) || !apiKeys[selectedProvider]) {
      return await throwError(
        ctx,
        "EmptyAPIKey",
        "API key not set with selected provider.",
        {
          provider: selectedProvider,
          model: args.modelId,
        },
        args.chatSlug,
        args.messageSlug
      );
    }

    const apiKey = apiKeys[selectedProvider];
    const hasToolSupport = selectedModel.capabilities.tool;
    const enableWebSearch = Boolean(args.enableWebSearch) && hasToolSupport;
    const isReasoningModel = selectedModel.capabilities.thinking;

    try {
      const model = createModelInstance(
        selectedProvider,
        apiKey,
        selectedModel
      );
      const tools = await configureTools(
        apiKeys,
        hasToolSupport,
        enableWebSearch,
        ctx,
        args.chatSlug,
        args.messageSlug
      );

      // Prepare messages
      const shouldAddReasoningInstructions = isReasoningModel;
      const messages = prepareMessages(
        args.prompt,
        args.messageHistory,
        selectedProvider,
        hasToolSupport,
        shouldAddReasoningInstructions
      );

      // Create stream
      const result = streamText({
        model,
        messages,
        tools,
        maxRetries: 0,
        onError: async (error) => {
          await throwError(
            ctx,
            "RequestError",
            "Error occurred streaming text for model.",
            {
              request: error.error,
              provider: selectedProvider,
              model: args.modelId,
            },
            args.chatSlug,
            args.messageSlug
          );
        },
      });

      // Process stream
      const streamConfig: StreamConfig = {
        ctx,
        chatSlug: args.chatSlug,
        messageSlug: args.messageSlug,
        isReasoningModel,
        selectedProvider,
      };

      return await processStream(result, streamConfig, args.modelId);
    } catch (error: any) {
      console.error(error);

      if (
        !(error instanceof ConvexError && error.name === "GenerationCancelled")
      ) {
        await ctx.runMutation(api.generations.cleanup, {
          messageId: args.messageSlug,
        });
      }

      if (error instanceof ConvexError) {
        return await throwError(
          ctx,
          error.name,
          error.message,
          error.details,
          args.chatSlug,
          args.messageSlug
        );
      } else {
        return await throwError(
          ctx,
          "RequestError",
          "Error occurred when trying to query AI provider for response.",
          {
            request: error.error,
            provider: selectedProvider,
            model: args.modelId,
          },
          args.chatSlug,
          args.messageSlug
        );
      }
    }
  },
});
