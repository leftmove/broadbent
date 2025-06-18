// AUTO-GENERATED FILE. DO NOT EDIT.



export const openai = {
  provider: "openai",
  name: "OpenAI",
  links: [
    {
      name: "Home",
      link: "https://openai.com"
    },
    {
      name: "Models",
      link: "https://platform.openai.com/docs/models"
    },
    {
      name: "Pricing",
      link: "https://platform.openai.com/docs/pricing"
    },
    {
      name: "Documentation",
      link: "https://platform.openai.com/docs/overview"
    },
    {
      name: "Console",
      link: "https://platform.openai.com/api-keys"
    }
  ],
  models: [
    {
      name: "GPT-4o",
      id: "gpt-4o",
      description: "OpenAI's general purpose model. Fast, intelligent, and flexible.",
      capabilities: {
        tool: true
      },
      input: {
        text: true,
        image: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 128000
        },
        {
          output: 16384
        }
      ]
    },
    {
      name: "GPT-4o mini",
      id: "gpt-4o-mini",
      description: "OpenAI's smaller, faster, and more affordable general purpose model. Made for focused tasks.",
      capabilities: {
        tool: true
      },
      input: {
        text: true,
        image: true
      },
      context: [
        {
          window: 128000
        },
        {
          output: 16384
        }
      ]
    },
    {
      name: "GPT-4o Audio",
      id: "gpt-4o-audio-preview",
      description: "OpenAI's general purpose voice model. Capable of speaking and understanding.",
      capabilities: null,
      input: {
        text: true,
        audio: true
      },
      output: {
        text: true,
        audio: true
      },
      context: [
        {
          window: 200000
        },
        {
          output: 100000
        }
      ]
    },
    {
      name: "o1",
      id: "o1",
      description: "Previous full o-series reasoning model. Powerful and accurate, but less so than its successor.",
      capabilities: {
        tool: true,
        thinking: true
      },
      input: {
        text: true,
        image: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 200000
        },
        {
          output: 100000
        }
      ]
    },
    {
      name: "o1-mini",
      id: "o1-mini",
      description: "Smaller and more affordable alternative to o1. Capable of reasoning, with a smaller context window.",
      capabilities: {
        tool: true,
        thinking: true
      },
      input: {
        text: true,
        image: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 128000
        },
        {
          output: 65536
        }
      ]
    },
    {
      name: "o3",
      id: "o3",
      description: "OpenAI's latest and most powerful reasoning model. Most intelligent and accurate model.",
      capabilities: {
        tool: true,
        thinking: true
      },
      input: {
        text: true,
        image: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 200000
        },
        {
          output: 100000
        }
      ]
    },
    {
      name: "o3-pro",
      id: "o3-pro",
      description: "Version of o3 with more computer for better responses. More expensive, but better performance.",
      capabilities: {
        tool: true,
        thinking: true
      },
      input: {
        text: true
      }
    },
    {
      name: "o3-mini",
      id: "o3-mini",
      description: "Smaller and more affordable alternative to o3. Capable of reasoning.",
      capabilities: {
        tool: true,
        thinking: true
      },
      input: {
        text: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 200000
        },
        {
          output: 100000
        }
      ]
    },
    {
      name: "o4-mini",
      id: "o4-mini",
      description: "Faster, more affordable reasoning model. High-intelligence and accuracy.",
      capabilities: {
        tool: true,
        thinking: true
      },
      input: {
        text: true,
        image: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 200000
        },
        {
          output: 100000
        }
      ]
    },
    {
      name: "GPT-4.1",
      id: "gpt-4.1",
      description: "OpenAI's flagship model for complex tasks.",
      capabilities: {
        tool: true
      },
      input: {
        text: true,
        image: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 1047576
        },
        {
          output: 32768
        }
      ]
    },
    {
      name: "GPT-4.1 mini",
      id: "gpt-4.1-mini",
      description: "Flagship model balanced for intelligence, speed, and cost.",
      capabilities: {
        tool: true
      },
      input: {
        text: true,
        image: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 1047576
        },
        {
          output: 32768
        }
      ]
    },
    {
      name: "GPT-4.1 nano",
      id: "gpt-4.1-nano",
      description: "Fastest and most cost-effective flagship model.",
      capabilities: {
        tool: true
      },
      input: {
        text: true,
        image: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 1047576
        },
        {
          output: 32768
        }
      ]
    },
    {
      name: "GPT-4.5",
      id: "gpt-4.5-preview",
      description: "Largest and most capable GPT model.",
      capabilities: {
        tool: true
      },
      input: {
        text: true,
        image: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 128000
        },
        {
          output: 16384
        }
      ]
    },
    {
      name: "ChatGPT-4o",
      id: "chatgpt-4o-latest",
      description: "ChatGPT's general purpose model. Modified version of GPT-4o.",
      capabilities: {
        tool: true
      },
      input: {
        text: true,
        image: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 128000
        },
        {
          output: 16384
        }
      ]
    },
    {
      name: "GPT-4",
      id: "gpt-4",
      description: "Older high-intelligence model. Less powerful than current models.",
      capabilities: null,
      input: {
        text: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 8192
        },
        {
          output: 8192
        }
      ]
    },
    {
      name: "GPT-4 Turbo",
      id: "gpt-4-turbo",
      description: "Older high-intelligence model. Better and more capable than GPT-4, but less powerful than current models.",
      capabilities: null,
      input: {
        text: true,
        image: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 128000
        },
        {
          output: 4096
        }
      ]
    },
    {
      name: "GPT-3.5",
      id: "gpt-3.5",
      description: "Legacy GPT model for cheaper chat and non-chat tasks.",
      capabilities: null,
      input: {
        text: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 16385
        },
        {
          output: 4096
        }
      ]
    },
    {
      name: "DALL-E 2",
      id: "dall-e-2",
      description: "Legacy text-to-image model.",
      capabilities: null,
      input: {
        text: true
      },
      output: {
        image: true
      },
      context: {
        unit: "image"
      }
    },
    {
      name: "DALL-E 3",
      id: "dall-e-3",
      description: "Previous generation text-to-image model.",
      capabilities: null,
      input: {
        text: true
      },
      output: {
        image: true
      },
      context: {
        unit: "image"
      }
    },
    {
      name: "GPT Image 1",
      id: "gpt-image-1",
      description: "OpenAI's latest state-of-the-art image generation model.",
      capabilities: null,
      input: {
        text: true,
        image: true
      },
      output: {
        image: true
      },
      context: {
        unit: "image",
        output: 1
      }
    }
  ]
} as const;

export const anthropic = {
  provider: "anthropic",
  name: "Anthropic",
  links: [
    {
      name: "Home",
      link: "https://www.anthropic.com/"
    },
    {
      name: "Models",
      link: "https://docs.anthropic.com/en/docs/about-claude/models/overview"
    },
    {
      name: "Pricing",
      link: "https://www.anthropic.com/pricing"
    },
    {
      name: "Documentation",
      link: "https://docs.anthropic.com/en/docs/api"
    },
    {
      name: "Console",
      link: "https://console.anthropic.com/"
    }
  ],
  models: [
    {
      name: "Claude Opus 4",
      id: "claude-opus-4",
      description: "Anthropic's most powerful model. Highest level of intelligence and capability.",
      capabilities: {
        thinking: true,
        tool: true
      },
      input: {
        text: true,
        image: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 200000
        },
        {
          output: 32000
        }
      ]
    },
    {
      name: "Claude Sonnet 4",
      id: "claude-sonnet-4",
      description: "Effective model with exceptional reasoning capabilities. High intelligence and balanced performance",
      capabilities: {
        thinking: true,
        tool: true
      },
      input: {
        text: true,
        image: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 200000
        },
        {
          output: 64000
        }
      ]
    },
    {
      name: "Claude Sonnet 3.7",
      id: "claude-3-7-sonnet-latest",
      description: "High-performance and high-intelligence model with early extended thinking. Extended thinking is toggleable.",
      capabilities: {
        thinking: true,
        tool: true
      },
      input: {
        text: true,
        image: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 200000
        },
        {
          output: 64000
        }
      ]
    },
    {
      name: "Claude Sonnet 3.5",
      id: "claude-3-5-sonnet-latest",
      description: "Previous, less powerful intelligence model. On the higher end of intelligence and capability.",
      capabilities: {
        tool: true
      },
      input: {
        text: true,
        image: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 200000
        },
        {
          output: 8192
        }
      ]
    },
    {
      name: "Claude Haiku 3.5",
      id: "claude-3-5-haiku-latest",
      description: "Fastest model. Less powerful, but has mid-level intelligence at blazing speeds.",
      capabilities: {
        tool: true
      },
      input: {
        text: true,
        image: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 200000
        },
        {
          output: 8192
        }
      ]
    },
    {
      name: "Claude Opus 3",
      id: "claude-3-opus-latest",
      description: "Previous power model. Top-level intelligence, fluency, and understanding.",
      capabilities: {
        tool: true
      },
      input: {
        text: true,
        image: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 200000
        },
        {
          output: 4096
        }
      ]
    },
    {
      name: "Claude Haiku 3",
      id: "claude-3-haiku-latest",
      description: "Least powerful model, but fast. Quick and accurate targeted performance.",
      capabilities: {
        tool: true
      },
      input: {
        text: true,
        image: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 200000
        },
        {
          output: 4096
        }
      ]
    }
  ]
} as const;

export const xai = {
  provider: "xai",
  name: "xAI",
  links: [
    {
      name: "Home",
      link: "https://x.ai/"
    },
    {
      name: "Models",
      link: "https://docs.x.ai/docs/models"
    },
    {
      name: "Pricing",
      link: "https://docs.x.ai/docs/models"
    },
    {
      name: "Documentation",
      link: "https://docs.x.ai/docs/overview"
    },
    {
      name: "Console",
      link: "https://console.x.ai/team/default/api-keys"
    }
  ],
  models: [
    {
      name: "Grok 3",
      id: "grok-3",
      description: "xAI's latest and most powerful model. Excels at various tasks with strong domain knowledge.",
      capabilities: {
        tool: true
      },
      input: {
        text: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 131072
        }
      ]
    },
    {
      name: "Grok 3 Fast",
      id: "grok-3-fast",
      description: "Same model with identical performance as Grok 3, but faster in exchange for higher costs.",
      capabilities: {
        tool: true
      },
      input: {
        text: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 131072
        }
      ]
    },
    {
      name: "Grok 3 Mini (with Thinking)",
      id: "grok-3-mini",
      description: "Lighter weight model with reasoning. Fast, smart, and great for logic-based tasks that do not require deep domain knowledge",
      capabilities: {
        tool: true,
        thinking: true
      },
      input: {
        text: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 131072
        }
      ]
    },
    {
      name: "Grok 3 Mini Fast (with Thinking)",
      id: "grok-3-mini-fast",
      description: "Same model with identical performance as Grok 3 Mini, but faster in exchange for higher costs.",
      capabilities: {
        tool: true,
        thinking: true
      },
      input: {
        text: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 131072
        }
      ]
    },
    {
      name: "Grok 2 Vision",
      id: "grok-2-vision",
      description: "Previous generation model with vision capabilities. Less capable than current models, but still powerful.",
      capabilities: {
        tool: true
      },
      input: {
        text: true,
        image: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 8192
        }
      ]
    },
    {
      name: "Grok 2 Image",
      id: "grok-2-image",
      description: "Previous generation model with image capabilities. Less capable than current models, but still powerful.",
      capabilities: {
        tool: true
      },
      input: {
        text: true
      },
      output: {
        image: true
      },
      context: [
        {
          window: 131072
        }
      ]
    },
    {
      name: "Grok 2",
      id: "grok-2",
      description: "Previous generation general purpose model. Less capable than current models, but still powerful.",
      capabilities: {
        tool: true
      },
      input: {
        text: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 131072
        }
      ]
    }
  ]
} as const;

export const groq = {
  provider: "groq",
  name: "Groq",
  links: [
    {
      name: "Home",
      link: "https://groq.com"
    },
    {
      name: "Models",
      link: "https://console.groq.com/docs/models"
    },
    {
      name: "Pricing",
      link: "https://groq.com/pricing/"
    },
    {
      name: "Documentation",
      link: "https://console.groq.com/docs/overview"
    },
    {
      name: "Console",
      link: "https://console.groq.com/keys"
    }
  ],
  models: [
    {
      name: "Gemma 2",
      id: "gemma2-9b-it",
      description: "Lightweight, open-weight model well-suited for a variety of text generation tasks. From Google, and built from the same research and technology used to create the Gemini models.",
      capabilities: {
        tool: true
      },
      input: {
        text: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 8192
        }
      ]
    },
    {
      name: "Llama 3.3 Versatile",
      id: "llama-3.3-70b-versatile",
      description: "Meta's most advanced multilingual large language model, optimized for a wide range of natural language processing tasks. High performance and efficiency.",
      capabilities: {
        tool: true,
        thinking: true
      },
      input: {
        text: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 128000
        },
        {
          output: 32768
        }
      ]
    },
    {
      name: "Llama 3.1 8B Instant",
      id: "llama-3.1-8b-instant",
      description: "Model with a balance of speed and performance with significant cost savings compared to larger models. Low-latency, high-quality responses.",
      capabilities: {
        tool: true
      },
      input: {
        text: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 128000
        },
        {
          output: 8192
        }
      ]
    },
    {
      name: "Llama 3 70b 8192",
      id: "llama3-70b-8192",
      description: "Model with a balance of performance and speed as a reliable foundation model that excels at dialogue and content-generation for tasks requiring smaller context windows.",
      capabilities: {
        tool: true
      },
      input: {
        text: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 8192
        }
      ]
    },
    {
      name: "Llama 3 8B 8192",
      id: "llama3-8b-8192",
      description: "Economical model with great performance, industry-leading speed, and cost-efficiency.",
      capabilities: {
        tool: true
      },
      input: {
        text: true
      },
      output: {
        text: true
      },
      context: [
        {
          window: 8192
        }
      ]
    }
  ]
} as const;

export const google = {
  provider: "google",
  name: "Google",
  links: [
    {
      name: "Home",
      link: "https://gemini.google.com"
    },
    {
      name: "Models",
      link: "https://ai.google.dev/gemini-api/docs/models"
    },
    {
      name: "Pricing",
      link: "https://ai.google.dev/gemini-api/docs/pricing"
    },
    {
      name: "Documentation",
      link: "https://ai.google.dev/gemini-api/docs"
    },
    {
      name: "Console",
      link: "https://aistudio.google.com"
    }
  ],
  models: [
    {
      name: "Gemini 2.5 Pro",
      id: "gemini-2.5-pro-preview-06-05",
      description: "Google's most powerful model, with enhanced thinking and reasoning, multimodal understanding, and state-of-the-art performance.",
      capabilities: {
        thinking: true,
        tool: true
      },
      input: {
        text: true,
        image: true,
        audio: true,
        video: true
      },
      output: {
        text: true
      },
      context: [
        {
          input: 1048576
        },
        {
          output: 65536
        }
      ]
    },
    {
      name: "Gemini 2.5 Flash",
      id: "gemini-2.5-flash-preview-05-20",
      description: "Google's best model in terms of price-performance, offering well-rounded capabilities. Offers the same features as its predecessor.",
      capabilities: {
        tool: true
      },
      input: {
        text: true,
        image: true,
        audio: true,
        video: true
      },
      output: {
        text: true
      },
      context: [
        {
          input: 1048576
        },
        {
          output: 65536
        }
      ]
    },
    {
      name: "Gemini 2.0 Flash",
      id: "gemini-2.0-flash",
      description: "Well-rounded model with next-gen features and improved capabilities, including superior speed, native tool usage, and a wider context window. Still near the top of the price-performance spectrum, but worse than its successor.",
      capabilities: {
        tool: true
      },
      input: {
        text: true,
        image: true,
        audio: true,
        video: true
      },
      output: {
        text: true
      },
      context: [
        {
          input: 1048576
        },
        {
          output: 8192
        }
      ]
    },
    {
      name: "Gemini 2.0 Flash Lite",
      id: "gemini-2.0-flash-lite",
      description: "Lite version of this generation's flash, with reduced capabilities in exchange for cost efficiency and lower latency.",
      capabilities: {
        tool: true
      },
      input: {
        text: true,
        image: true,
        audio: true,
        video: true
      },
      output: {
        text: true
      },
      context: [
        {
          input: 1048576
        },
        {
          output: 8192
        }
      ]
    },
    {
      name: "Gemini 1.5 Pro",
      id: "gemini-1.5-pro",
      description: "Mid-size multimodal model that is optimized for a wide-range of reasoning tasks. Has the largest context window overall, but worse capabilities than its successor.",
      capabilities: {
        tool: true
      },
      input: {
        text: true,
        image: true,
        audio: true,
        video: true
      },
      output: {
        text: true
      },
      context: [
        {
          input: 2097152
        },
        {
          output: 8192
        }
      ]
    },
    {
      name: "Gemini 1.5 Flash",
      id: "gemini-1.5-flash",
      description: "Smaller and less powerful with reduced capabilities, but still a fast and versatile multimodal model for scaling across diverse tasks.",
      capabilities: {
        tool: true
      },
      input: {
        text: true,
        image: true,
        audio: true,
        video: true
      },
      output: {
        text: true
      },
      context: [
        {
          input: 1048576
        },
        {
          output: 8192
        }
      ]
    },
    {
      name: "Gemini 1.5 Flash 8B",
      id: "gemini-1.5-flash-8b",
      description: "Lite version of this generation's flash. Smallest model, designed for low intelligence tasks.",
      capabilities: {
        tool: true
      },
      input: {
        text: true,
        image: true,
        audio: true,
        video: true
      },
      output: {
        text: true
      },
      context: [
        {
          input: 1048576
        },
        {
          output: 8192
        }
      ]
    },
    {
      name: "Imagen 3",
      id: "imagen-3.0-generate-002",
      description: "Google's highest quality text-to-image model, capable of generating images with even better detail, richer lighting and fewer distracting artifacts than our previous models.",
      capabilities: null,
      input: {
        text: true
      },
      output: {
        image: true
      },
      context: [
        {
          unit: "image"
        },
        {
          output: 4
        }
      ]
    },
    {
      name: "Veo 2",
      id: "veo-2.0-generate-001",
      description: "Google's best video model, offering high quality text- and image-to-video. Capable of generating detailed videos, and capturing nuance within prompts.",
      capabilities: null,
      input: {
        text: true,
        image: true
      },
      output: {
        video: true
      },
      context: [
        {
          unit: "video"
        },
        {
          output: 2
        }
      ]
    }
  ]
} as const;


export const modelSpecs = { openai, anthropic, xai, groq, google } as const;

