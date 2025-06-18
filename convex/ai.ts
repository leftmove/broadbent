import { action, ActionCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";

import { streamText, wrapLanguageModel, extractReasoningMiddleware } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createXai } from "@ai-sdk/xai";
import { createGroq } from "@ai-sdk/groq";

import { webSearchTool } from "../lib/tools/web-search";

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
    const hasToolSupport =
      selectedModel.capabilities.tool && args.enableWebSearch;

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
        // Enable search grounding if web search is enabled
        if (hasToolSupport && args.enableWebSearch) {
          model = llm(selectedModel.id, { useSearchGrounding: true });
        } else {
          model = llm(selectedModel.id);
        }
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

    // Add search instructions for Anthropic models when web search is enabled
    let userContent = args.prompt;
    if (selectedProvider === "anthropic" && hasToolSupport) {
      userContent = `${args.prompt}\n\nIMPORTANT: You have access to a web search tool. If this question requires current information, recent events, or data that might not be in your training data, please use the webSearch tool to find the most up-to-date information before responding.`;
    }

    if (shouldAddReasoningInstructions) {
      userContent += `\n\nPlease show your reasoning process by thinking through this step by step within <think></think> tags before providing your final answer.`;
    }

    // Prepare messages with system instruction for Anthropic when search is enabled
    const messages: Message[] = [];

    // Add system message for Anthropic models with web search
    if (selectedProvider === "anthropic" && hasToolSupport) {
      messages.push({
        role: "assistant",
        content:
          "You have access to a webSearch tool that can search the internet for current information. Use this tool when:\n- The user asks about recent events, current news, or real-time data\n- You need information that might have changed since your training cutoff\n- The question involves current prices, stocks, weather, or other time-sensitive information\n- The user explicitly asks you to search for something\n\nAlways call the webSearch tool BEFORE responding if the question requires current information.",
      });
    }

    // Add message history and user message
    messages.push(...(args.messageHistory || []));
    messages.push({
      role: "user",
      content: userContent,
    });

    // Configure tools based on provider
    let tools: any = undefined;
    if (hasToolSupport) {
      switch (selectedProvider) {
        case "openai":
          if (selectedModel.id.includes("gpt-4o")) {
            // Use OpenAI's built-in web search for responses API
            tools = {
              web_search_preview: (llm as any).tools?.webSearchPreview?.(),
            };
          } else {
            // Use custom web search tool for regular OpenAI models
            tools = { webSearch: webSearchTool };
          }
          break;
        case "google":
          // Google uses useSearchGrounding, no additional tools needed
          tools = undefined;
          break;
        default:
          // Use custom web search tool for other providers
          tools = { webSearch: webSearchTool };
          break;
      }
    }

    try {
      if (isReasoningModel) {
        const result = streamText({
          model,
          messages,
          tools,
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
        const collectedSources: Array<{
          title: string;
          url: string;
          excerpt?: string;
        }> = [];

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
          } else if (chunk.type === "tool-call") {
            console.log(
              `[${selectedProvider}] Tool call started:`,
              chunk.toolName,
              chunk.toolCallId
            );
            // If a web search tool is being called, the search has actually started
            if (chunk.toolName === "webSearch") {
              console.log(
                `[${selectedProvider}] Web search tool call detected - search is actually happening`
              );
              console.log("Search args:", chunk.args);
            }
          } else if (chunk.type === "tool-result") {
            console.log(
              `[${selectedProvider}] Tool result for:`,
              chunk.toolName
            );
            console.log("Tool result data:", chunk.result);
            // Handle tool results to extract sources
            if (chunk.toolName === "webSearch" && chunk.result) {
              try {
                // For different providers, the search results might be in different formats
                // Try to extract sources from the tool result
                if (
                  selectedProvider === "google" &&
                  chunk.result.searchResults
                ) {
                  // Google Search Grounding results
                  const searchResults = chunk.result.searchResults;
                  for (const result of searchResults) {
                    if (result.title && result.uri) {
                      collectedSources.push({
                        title: result.title,
                        url: result.uri,
                        excerpt:
                          result.snippet || result.content?.substring(0, 200),
                      });
                    }
                  }
                } else if (
                  selectedProvider === "openai" &&
                  chunk.result.sources
                ) {
                  // OpenAI web browsing results
                  const sources = chunk.result.sources;
                  for (const source of sources) {
                    if (source.title && source.url) {
                      collectedSources.push({
                        title: source.title,
                        url: source.url,
                        excerpt: source.excerpt || source.snippet,
                      });
                    }
                  }
                } else if (
                  chunk.result.sources &&
                  Array.isArray(chunk.result.sources)
                ) {
                  // Custom webSearchTool sources format
                  for (const source of chunk.result.sources) {
                    if (source.title && source.url) {
                      collectedSources.push({
                        title: source.title,
                        url: source.url,
                        excerpt: source.excerpt || "No excerpt available",
                      });
                    }
                  }
                }
              } catch (error) {
                console.error(
                  "Error extracting sources from tool result:",
                  error
                );
              }
            }
          }
        }

        // Extract sources from AI SDK result (for providers that support it)
        let sources:
          | Array<{ title: string; url: string; excerpt?: string }>
          | undefined;

        const resultSources = await result.sources;
        if (resultSources && resultSources.length > 0) {
          sources = resultSources
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
          // Use collected sources from tool results
          sources = collectedSources;
        }

        // Final update with sources if web search was enabled
        if (sources) {
          await ctx.runMutation(api.messages.updateBySlug, {
            chatSlug: args.chatSlug,
            messageSlug: args.messageSlug,
            content: stripThinkTags(fullText),
            thinking: fullThinking || undefined,
            sources,
          });
        }

        // Clean up generation record on success
        await ctx.runMutation(api.generations.cleanup, {
          messageId: args.messageSlug,
        });

        return {
          content: stripThinkTags(fullText),
          thinking: fullThinking || undefined,
          sources,
        };
      } else {
        const result = streamText({
          model,
          messages,
          tools,
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
        const collectedSources: Array<{
          title: string;
          url: string;
          excerpt?: string;
        }> = [];

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

          if (chunk.type === "text-delta") {
            fullText += chunk.textDelta;
            await ctx.runMutation(api.messages.updateBySlug, {
              chatSlug: args.chatSlug,
              messageSlug: args.messageSlug,
              content: fullText,
            });
          } else if (chunk.type === "tool-call") {
            console.log(
              `[${selectedProvider}] Tool call started:`,
              chunk.toolName,
              chunk.toolCallId
            );
            // If a web search tool is being called, the search has actually started
            if (chunk.toolName === "webSearch") {
              console.log(
                `[${selectedProvider}] Web search tool call detected - search is actually happening`
              );
              console.log("Search args:", chunk.args);
            }
          } else if (chunk.type === "tool-result") {
            console.log(
              `[${selectedProvider}] Tool result for:`,
              chunk.toolName
            );
            console.log("Tool result data:", chunk.result);
            // Handle tool results to extract sources (same logic as reasoning models)
            if (chunk.toolName === "webSearch" && chunk.result) {
              try {
                if (
                  selectedProvider === "google" &&
                  chunk.result.searchResults
                ) {
                  const searchResults = chunk.result.searchResults;
                  for (const result of searchResults) {
                    if (result.title && result.uri) {
                      collectedSources.push({
                        title: result.title,
                        url: result.uri,
                        excerpt:
                          result.snippet || result.content?.substring(0, 200),
                      });
                    }
                  }
                } else if (
                  selectedProvider === "openai" &&
                  chunk.result.sources
                ) {
                  const sources = chunk.result.sources;
                  for (const source of sources) {
                    if (source.title && source.url) {
                      collectedSources.push({
                        title: source.title,
                        url: source.url,
                        excerpt: source.excerpt || source.snippet,
                      });
                    }
                  }
                } else if (
                  chunk.result.sources &&
                  Array.isArray(chunk.result.sources)
                ) {
                  // Custom webSearchTool sources format
                  for (const source of chunk.result.sources) {
                    if (source.title && source.url) {
                      collectedSources.push({
                        title: source.title,
                        url: source.url,
                        excerpt: source.excerpt || "No excerpt available",
                      });
                    }
                  }
                }
              } catch (error) {
                console.error(
                  "Error extracting sources from tool result:",
                  error
                );
              }
            }
          }
        }

        // Extract sources from AI SDK result (for providers that support it)
        let sources:
          | Array<{ title: string; url: string; excerpt?: string }>
          | undefined;

        const resultSources = await result.sources;
        if (resultSources && resultSources.length > 0) {
          sources = resultSources
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
          // Use collected sources from tool results
          sources = collectedSources;
        }

        // Final update with sources if web search was enabled
        if (sources) {
          await ctx.runMutation(api.messages.updateBySlug, {
            chatSlug: args.chatSlug,
            messageSlug: args.messageSlug,
            content: fullText,
            sources,
          });
        }

        // Clean up generation record on success
        await ctx.runMutation(api.generations.cleanup, {
          messageId: args.messageSlug,
        });

        return { content: fullText, sources };
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
