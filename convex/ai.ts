import { action, ActionCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
import { v } from "convex/values";

import {
  streamText,
  ToolSet,
  type StreamTextOnChunkCallback,
  type StreamTextOnStepFinishCallback,
  type StreamTextOnFinishCallback,
  type LanguageModelUsage,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createXai } from "@ai-sdk/xai";
import { createGroq } from "@ai-sdk/groq";

import { createWebSearchTool, WebSearchResult } from "../lib/tools/web-search";
import { llms, type Message } from "../lib/ai/providers";
import { AIProvider, Model, type ModelId } from "../lib/ai/models";
import { Context, determineContext } from "../lib/ai/context";
import { buildSystemPrompt } from "../lib/ai/prompts";
import { handleError, ErrorDetails } from "../lib/handlers";
import { modelIdsValidator } from "./schema";
import { CustomError } from "../lib/errors";

interface GenerateResponse {
  content: string;
  thinking?: string;
  tools?: Array<{
    name: string;
    result: string;
    type: "tool_result" | "tool_call";
  }>;
}

interface Source {
  title: string;
  url: string;
  excerpt?: string;
}

interface StreamState {
  fullText: string;
  fullThinking: string;
  sources: Source[];
  isCancelled: boolean;
  hasError: boolean;
}

interface StreamConfig {
  ctx: ActionCtx;
  chatSlug: string;
  messageSlug: Id<"messages">;
  isReasoningModel: boolean;
  selectedProvider: string;
  modelId: string;
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
  provider: AIProvider,
  selectedModel: Model,
  apiKey: string
) {
  let llm;
  let model;

  try {
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
    }
  } catch (error) {
    const customError = new CustomError(
      "InvalidModel",
      "Error occurred selecting and creating model.",
      {
        error,
        model: selectedModel.id,
        provider: provider,
      }
    );
    throw customError;
  }

  return model;
}

async function configureTools(
  apiKeys: Record<string, string>,
  hasToolSupport: boolean,
  webSearchTool: boolean,
  ctx: ActionCtx,
  chatSlug: Id<"chats"> | string,
  messageSlug: Id<"messages"> | string,
  context: Context
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
  messages.push(
    ...((messageHistory || [])
      .filter((message) => message.content.trim() !== "") // Filter out empty messages
      .map((message) =>
        message.role === "user" ||
        message.role === "assistant" ||
        message.role === "system"
          ? {
              role: message.role,
              content: message.content,
            }
          : null
      )
      .filter((message) => message !== null) as Message[])
  );
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
  modelId: string,
  controller: AbortController
) {
  const isCancelled = await ctx.runQuery(api.generations.isCancelled, {
    messageId: messageSlug,
  });

  if (isCancelled) {
    controller.abort();
    // await ctx.runMutation(api.generations.cleanup, {
    //   messageId: messageSlug,
    // });
  }

  return isCancelled;
}

async function updateMessage(
  ctx: ActionCtx,
  chatSlug: string,
  messageSlug: Id<"messages">,
  content: string,
  thinking?: string,
  sources?: Source[],
  usage?: LanguageModelUsage,
  tools?: any[]
) {
  const updateData: any = {
    chatSlug,
    messageSlug,
    content,
  };

  if (thinking) {
    updateData.thinking = thinking;
  }

  if (sources && sources.length > 0) {
    updateData.sources = sources;
  }

  if (usage) {
    updateData.usage = {
      prompt: usage.promptTokens,
      completion: usage.completionTokens,
      total: usage.totalTokens,
    };
  }

  if (tools && tools.length > 0) {
    updateData.tools = tools;
  }

  await ctx.runMutation(api.messages.updateBySlug, updateData);
}

function createChunkHandler(
  config: StreamConfig,
  state: StreamState,
  controller: AbortController
) {
  return async ({
    chunk,
  }: Parameters<StreamTextOnChunkCallback<ToolSet>>[0]) => {
    // Check for cancellation on each chunk
    const cancellationResult = await checkCancellation(
      config.ctx,
      config.messageSlug,
      config.chatSlug,
      config.selectedProvider,
      config.modelId,
      controller
    );

    if (cancellationResult) {
      state.isCancelled = true;
      return;
    }

    if (chunk.type === "text-delta") {
      state.fullText += chunk.textDelta;
      await updateMessage(
        config.ctx,
        config.chatSlug,
        config.messageSlug,
        state.fullText,
        state.fullThinking || undefined
      );
    } else if (chunk.type === "reasoning") {
      if (chunk.textDelta) {
        state.fullThinking += chunk.textDelta;
        await updateMessage(
          config.ctx,
          config.chatSlug,
          config.messageSlug,
          state.fullText,
          state.fullThinking
        );
      }
    } else if (chunk.type === "tool-call") {
      if (chunk.toolName === "web") {
        await config.ctx.runMutation(api.generations.updateSearching, {
          messageId: config.messageSlug,
          searching: true,
        });
      }
    }
  };
}

function createStepFinishHandler(config: StreamConfig, state: StreamState) {
  return async (
    chunk: Parameters<StreamTextOnStepFinishCallback<ToolSet>>[0]
  ) => {
    // Build tools array for schema compliance
    const tools: any[] = [];

    // Add tool calls
    chunk.toolCalls.forEach((call: any) => {
      tools.push({
        type: "tool_call",
        toolCallId: call.toolCallId,
        toolName: call.toolName,
        args: call.args,
      });
    });

    // Add tool results and process web search
    if (chunk.toolResults) {
      chunk.toolResults.forEach((result: any, i: number) => {
        const call = chunk.toolCalls[i];
        if (!call) return;

        tools.push({
          type: "tool_result",
          toolCallId: call.toolCallId,
          toolName: call.toolName,
          result,
        });

        // Handle web search results
        if (call.toolName === "web" && result && Array.isArray(result.result)) {
          const webSources = result.result.map(
            (webResult: WebSearchResult) => ({
              title: webResult.title,
              url: webResult.source,
              excerpt: webResult.excerpt,
            })
          );
          state.sources.push(...webSources);

          // Turn off searching state
          void config.ctx.runMutation(api.generations.updateSearching, {
            messageId: config.messageSlug,
            searching: false,
          });
        }
      });
    }

    await updateMessage(
      config.ctx,
      config.chatSlug,
      config.messageSlug,
      state.fullText,
      state.fullThinking,
      state.sources.length > 0 ? state.sources : undefined,
      chunk.usage,
      tools.length > 0 ? tools : undefined
    );
  };
}

function createFinishHandler(config: StreamConfig, state: StreamState) {
  return async ({
    text,
    reasoning,
    usage,
  }: Parameters<StreamTextOnFinishCallback<ToolSet>>[0]) => {
    // Final cleanup and state update
    state.fullText = text;

    if (reasoning && !state.fullThinking) {
      state.fullThinking = reasoning;
    }

    // Store token usage if available
    if (usage) {
      await updateMessage(
        config.ctx,
        config.chatSlug,
        config.messageSlug,
        text,
        reasoning || state.fullThinking,
        state.sources.length > 0 ? state.sources : undefined,
        usage
      );
    }
    // Reset searching state and clean up generation record on success
    await config.ctx.runMutation(api.generations.updateSearching, {
      messageId: config.messageSlug,
      searching: false,
    });

    await config.ctx.runMutation(api.generations.cleanup, {
      messageId: config.messageSlug,
    });
  };
}

function createErrorHandler(
  config: StreamConfig,
  state: StreamState,
  controller: AbortController
) {
  return async ({ error }: { error: any }) => {
    controller.abort();
    state.hasError = true;
    await throwError(
      config.ctx,
      "RequestError",
      "Error occurred streaming text for model.",
      {
        error,
        request: error.error,
        provider: config.selectedProvider,
        model: config.modelId,
      },
      config.chatSlug,
      config.messageSlug
    );
  };
}

async function handleToolCalls(
  config: StreamConfig,
  tools: ToolSet | undefined
) {
  if (tools && tools.web) {
    await config.ctx.runMutation(api.generations.updateSearching, {
      messageId: config.messageSlug,
      searching: true,
    });
  }

  return tools;
}

function buildFinalResponse(state: StreamState): GenerateResponse {
  const returnData: any = {
    content: state.fullText,
  };

  if (state.fullThinking) {
    returnData.thinking = state.fullThinking;
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

    const messageHistory = await ctx.runQuery(api.messages.listBySlug, {
      chatSlug: args.chatSlug,
    });

    const apiKey = apiKeys[selectedProvider];
    const hasToolSupport = selectedModel.capabilities.tool;
    const isReasoningModel = selectedModel.capabilities.thinking;
    const instructWebSearch = Boolean(args.enableWebSearch) && hasToolSupport;
    const instructReasoning = isReasoningModel;

    const state: StreamState = {
      fullText: "",
      fullThinking: "",
      isCancelled: false,
      hasError: false,
      sources: [],
    };
    const config: StreamConfig = {
      ctx,
      chatSlug: args.chatSlug,
      messageSlug: args.messageSlug,
      isReasoningModel,
      selectedProvider,
      modelId: args.modelId,
    };

    try {
      const model = createModelInstance(
        selectedProvider,
        selectedModel,
        apiKey
      );

      // Prepare messages
      const messages = prepareMessages(
        args.prompt,
        messageHistory,
        instructWebSearch,
        instructReasoning
      );
      const context = determineContext(selectedModel, messageHistory);

      const controller = new AbortController();
      const tools = await configureTools(
        apiKeys,
        hasToolSupport,
        instructWebSearch,
        ctx,
        args.chatSlug,
        args.messageSlug,
        context
      );

      await handleToolCalls(config, tools);

      const result = streamText({
        model,
        messages,
        tools,
        maxRetries: 10,
        maxSteps: 10,
        abortSignal: controller.signal,
        onChunk: createChunkHandler(config, state, controller),
        onError: createErrorHandler(config, state, controller),
        onFinish: createFinishHandler(config, state),
        onStepFinish: createStepFinishHandler(config, state),
      });
      const reader = result.textStream.getReader();

      let i = 0;
      while (true) {
        const { done, value } = await reader.read();
        console.log(i, value);
        i++;
        if (done) break;
      }

      return buildFinalResponse(state);
    } catch (error: any) {
      if (error.name === "AbortError") {
        // Generation cancelled, do nothing.
        return buildFinalResponse(state);
      } else if (error instanceof CustomError) {
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
            error,
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
