import { action } from "./_generated/server";
import { v } from "convex/values";

import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createXai } from "@ai-sdk/xai";
import { createGroq } from "@ai-sdk/groq";

import { llms } from "../lib/ai/providers";
import { handleError } from "../lib/handlers";
import { modelIdsValidator } from "./schema";
import { api } from "./_generated/api";
import { ConvexError, CustomError } from "../lib/errors";
import { type ModelId } from "../lib/ai/models";

interface Message {
  role: "user" | "assistant";
  content: string;
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
          role: v.union(v.literal("user"), v.literal("assistant")),
          content: v.string(),
        })
      )
    ),
  },
  returns: v.object({
    content: v.string(),
    thinking: v.optional(v.string()),
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
    let apiKey: string;

    if (selectedProvider in apiKeys && apiKeys[selectedProvider]) {
      apiKey = apiKeys[selectedProvider];
    } else {
      const error = new CustomError(
        "EmptyAPIKey",
        "API key not set with selected provider.",
        {
          provider: selectedProvider,
          model: args.modelId,
        }
      );
      const message = handleError(error, {
        provider: selectedProvider,
        model: args.modelId,
      });
      await ctx.runMutation(api.messages.updateBySlug, {
        chatSlug: args.chatSlug,
        messageSlug: args.messageSlug,
        content: message,
        type: "error",
      });
      return { content: message };
    }

    let llm;
    let model;

    switch (selectedProvider) {
      case "openai":
        llm = createOpenAI({ apiKey });
        model = llm(selectedModel.id);
        break;
      case "anthropic":
        llm = createAnthropic({ apiKey });
        model = llm(selectedModel.id);
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
        throw new ConvexError(
          "InvalidProvider",
          "Invalid parameter given for provider.",
          {
            provider: selectedProvider,
            model: args.modelId,
          }
        );
    }

    const messages: Message[] = [
      ...(args.messageHistory || []),
      { role: "user", content: args.prompt },
    ];
    const isReasoningModel = selectedModel.capabilities.thinking;

    try {
      if (isReasoningModel) {
        const result = streamText({
          model,
          messages,
          maxRetries: 0,
          onError: (error) => {
            throw new ConvexError(
              "RequestError",
              "Error occurred streaming text for model.",
              {
                request: error.error,
                provider: selectedProvider,
                model: args.modelId,
              }
            );
          },
        });

        let fullText = "";
        let fullThinking = "";

        for await (const chunk of result.fullStream) {
          // Check for cancellation
          const isCancelled = await ctx.runQuery(api.generations.isCancelled, {
            messageId: args.messageSlug,
          });

          if (isCancelled) {
            await ctx.runMutation(api.generations.cleanup, {
              messageId: args.messageSlug,
            });
            throw new ConvexError(
              "GenerationCancelled",
              "Generation was cancelled by user.",
              {
                provider: selectedProvider,
                model: args.modelId,
              }
            );
          }

          if (chunk.type === "text-delta") {
            fullText += chunk.textDelta;
            await ctx.runMutation(api.messages.updateBySlug, {
              chatSlug: args.chatSlug,
              messageSlug: args.messageSlug,
              content: fullText,
              thinking: fullThinking || undefined,
            });
          } else if (
            chunk.type === "step-finish" &&
            chunk.providerMetadata?.openai?.reasoning
          ) {
            const reasoning = chunk.providerMetadata.openai.reasoning;
            if (typeof reasoning === "string") {
              fullThinking = reasoning;
              await ctx.runMutation(api.messages.updateBySlug, {
                chatSlug: args.chatSlug,
                messageSlug: args.messageSlug,
                content: fullText,
                thinking: fullThinking,
              });
            }
          }
        }

        // Clean up generation record on success
        await ctx.runMutation(api.generations.cleanup, {
          messageId: args.messageSlug,
        });

        return { content: fullText, thinking: fullThinking };
      } else {
        const { textStream } = streamText({
          model,
          messages,
          maxRetries: 0,
          onError: (error) => {
            throw new ConvexError(
              "RequestError",
              "Error occurred streaming text for model.",
              {
                request: error.error,
                provider: selectedProvider,
                model: args.modelId,
              }
            );
          },
        });

        let fullText = "";
        for await (const textPart of textStream) {
          // Check for cancellation
          const isCancelled = await ctx.runQuery(api.generations.isCancelled, {
            messageId: args.messageSlug,
          });

          if (isCancelled) {
            await ctx.runMutation(api.generations.cleanup, {
              messageId: args.messageSlug,
            });
            throw new ConvexError(
              "GenerationCancelled",
              "Generation was cancelled by user.",
              {
                provider: selectedProvider,
                model: args.modelId,
              }
            );
          }

          fullText += textPart;
          await ctx.runMutation(api.messages.updateBySlug, {
            chatSlug: args.chatSlug,
            messageSlug: args.messageSlug,
            content: fullText,
          });
        }

        // Clean up generation record on success
        await ctx.runMutation(api.generations.cleanup, {
          messageId: args.messageSlug,
        });

        return { content: fullText };
      }
    } catch (error: any) {
      console.log(error);

      if (
        !(error instanceof ConvexError && error.name === "GenerationCancelled")
      ) {
        await ctx.runMutation(api.generations.cleanup, {
          messageId: args.messageSlug,
        });
      }

      if (error instanceof ConvexError) {
        const message = handleError(error, {
          provider: selectedProvider,
          model: args.modelId,
        });
        await ctx.runMutation(api.messages.updateBySlug, {
          chatSlug: args.chatSlug,
          messageSlug: args.messageSlug,
          content: message,
          type: "error",
        });
        return { content: message };
      } else {
        const customError = new CustomError(
          "RequestError",
          "Error occurred when trying to query AI provider for response.",
          "error" in error
            ? {
                request: error.error,
                provider: selectedProvider,
                model: args.modelId,
              }
            : {
                message: error.message,
                provider: selectedProvider,
                model: args.modelId,
              }
        );
        const message = handleError(customError, {
          provider: selectedProvider,
          model: args.modelId,
        });
        await ctx.runMutation(api.messages.updateBySlug, {
          chatSlug: args.chatSlug,
          messageSlug: args.messageSlug,
          content: message,
          type: "error",
        });
        return { content: message };
      }
    }
  },
});
