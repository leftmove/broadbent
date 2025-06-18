import { action, ActionCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";

import { streamText, wrapLanguageModel, extractReasoningMiddleware } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createXai } from "@ai-sdk/xai";
import { createGroq } from "@ai-sdk/groq";

import { llms } from "../lib/ai/providers";
import { handleError, ErrorDetails } from "../lib/handlers";
import { modelIdsValidator } from "./schema";
import { api } from "./_generated/api";
import { ConvexError, CustomError } from "../lib/errors";
import { type ModelId } from "../lib/ai/models";

interface Message {
  role: "user" | "assistant";
  content: string;
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
        return await throwError(
          ctx,
          "InvalidProvider",
          "Invalid parameter given for provider.",
          {
            provider: selectedProvider,
            model: args.modelId,
          },
          args.chatSlug,
          args.messageSlug
        );
    }

    const isReasoningModel = selectedModel.capabilities.thinking;

    // Wrap model with reasoning middleware for reasoning models that don't natively support it
    if (isReasoningModel && selectedProvider !== "openai") {
      model = wrapLanguageModel({
        model,
        middleware: extractReasoningMiddleware({
          tagName: "think",
          startWithReasoning: true,
        }),
      });
    }

    // Add reasoning instructions for non-OpenAI reasoning models
    const shouldAddReasoningInstructions =
      isReasoningModel && selectedProvider !== "openai";

    const messages: Message[] = [
      ...(args.messageHistory || []),
      {
        role: "user",
        content: shouldAddReasoningInstructions
          ? `${args.prompt}\n\nPlease show your reasoning process by thinking through this step by step within <think></think> tags before providing your final answer.`
          : args.prompt,
      },
    ];

    try {
      if (isReasoningModel) {
        const result = streamText({
          model,
          messages,
          maxRetries: 0,
          onError: async (error) => {
            void (await throwError(
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
            ));
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
            return await throwError(
              ctx,
              "GenerationCancelled",
              "Generation was cancelled by user.",
              {
                provider: selectedProvider,
                model: args.modelId,
              },
              args.chatSlug,
              args.messageSlug
            );
          }

          console.log("Chunk:", chunk.type, Object.keys(chunk));
          if (chunk.type === "reasoning") {
            console.log("Reasoning chunk:", chunk);
          }
          if (
            chunk.type === "text-delta" &&
            chunk.textDelta?.includes("<think>")
          ) {
            console.log("Text delta with think tag:", chunk.textDelta);
          }

          if (chunk.type === "text-delta") {
            fullText += chunk.textDelta;

            // Extract thinking from text stream for real-time streaming
            const extractedThinking = extractThinkingFromText(fullText);
            if (extractedThinking && extractedThinking !== fullThinking) {
              fullThinking = extractedThinking;
            }

            await ctx.runMutation(api.messages.updateBySlug, {
              chatSlug: args.chatSlug,
              messageSlug: args.messageSlug,
              content: stripThinkTags(fullText),
              thinking: fullThinking || undefined,
            });
          } else if (chunk.type === "reasoning") {
            // Handle reasoning chunks
            if (chunk.textDelta) {
              fullThinking += chunk.textDelta;
              await ctx.runMutation(api.messages.updateBySlug, {
                chatSlug: args.chatSlug,
                messageSlug: args.messageSlug,
                content: fullText,
                thinking: stripThinkTags(fullThinking),
              });
            }
          } else if (chunk.type === "step-finish") {
            console.log("Step finish:", chunk, Object.keys(chunk));
            // Handle OpenAI native reasoning (overrides extracted thinking)
            if (chunk.providerMetadata?.openai?.reasoning) {
              const reasoning = chunk.providerMetadata.openai.reasoning;
              if (typeof reasoning === "string") {
                fullThinking = reasoning;
                await ctx.runMutation(api.messages.updateBySlug, {
                  chatSlug: args.chatSlug,
                  messageSlug: args.messageSlug,
                  content: stripThinkTags(fullText),
                  thinking: fullThinking,
                });
              }
            }
            // Handle reasoning from extractReasoningMiddleware (use if we don't have extracted thinking)
            else if (chunk?.providerMetadata?.reasoning && !fullThinking) {
              const reasoning = chunk.providerMetadata.reasoning;
              if (typeof reasoning === "string") {
                fullThinking = stripThinkTags(reasoning);
                await ctx.runMutation(api.messages.updateBySlug, {
                  chatSlug: args.chatSlug,
                  messageSlug: args.messageSlug,
                  content: stripThinkTags(fullText),
                  thinking: fullThinking,
                });
              }
            }
          }
        }

        // Clean up generation record on success
        await ctx.runMutation(api.generations.cleanup, {
          messageId: args.messageSlug,
        });

        return {
          content: stripThinkTags(fullText),
          thinking: fullThinking || undefined,
        };
      } else {
        const { textStream } = streamText({
          model,
          messages,
          maxRetries: 0,
          onError: async (error) => {
            void (await throwError(
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
            ));
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
            return await throwError(
              ctx,
              "GenerationCancelled",
              "Generation was cancelled by user.",
              {
                provider: selectedProvider,
                model: args.modelId,
              },
              args.chatSlug,
              args.messageSlug
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
