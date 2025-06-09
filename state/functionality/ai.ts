import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

interface ApiKeys {
  openai: string
  anthropic: string
  google: string
}

export const useAIGeneration = () => {
  const generateResponse = async (
    prompt: string,
    provider: 'openai' | 'anthropic' | 'google',
    apiKeys: ApiKeys
  ): Promise<string> => {
    let model

    switch (provider) {
      case 'openai':
        if (!apiKeys.openai) throw new Error('OpenAI API key not set')
        const openai = createOpenAI({ apiKey: apiKeys.openai })
        model = openai('gpt-4-turbo-preview')
        break
      
      case 'anthropic':
        if (!apiKeys.anthropic) throw new Error('Anthropic API key not set')
        const anthropic = createAnthropic({ apiKey: apiKeys.anthropic })
        model = anthropic('claude-3-sonnet-20240229')
        break
      
      case 'google':
        if (!apiKeys.google) throw new Error('Google API key not set')
        const google = createGoogleGenerativeAI({ apiKey: apiKeys.google })
        model = google('gemini-pro')
        break
      
      default:
        throw new Error('Invalid provider')
    }

    const { text } = await generateText({
      model,
      prompt,
      maxTokens: 1000,
    })

    return text
  }

  return { generateResponse }
}
