import { streamText } from 'ai';
import { createAIProvider, type AIConfig } from './providers';

export interface StreamConfig extends AIConfig {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

export async function streamAIResponse(config: StreamConfig) {
  try {
    const provider = createAIProvider(config);
    
    const result = await streamText({
      model: provider(config.model),
      messages: config.messages,
    });

    let fullText = '';

    for await (const chunk of result.textStream) {
      fullText += chunk;
      config.onChunk?.(chunk);
    }

    config.onComplete?.(fullText);
    return fullText;
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    config.onError?.(err);
    throw err;
  }
}