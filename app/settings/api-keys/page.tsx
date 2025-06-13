"use client";
import React, { useState, useEffect, SVGProps } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";

import { Key, Check, Eye, EyeOff, Loader2 } from "lucide-react";

import { useSettingsState } from "state/settings";
import { AIProvider, providerModels } from "lib/ai/providers";
import { cn } from "lib/utils";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { RouteGuard } from "components/route-guard";

// SVG Icon Components
const OpenAIIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    width="100"
    height="100"
    viewBox="0 0 50 50"
    {...props}
  >
    <path
      className="fill-gray-900 dark:fill-white"
      d="M45.403,25.562c-0.506-1.89-1.518-3.553-2.906-4.862c1.134-2.665,0.963-5.724-0.487-8.237	c-1.391-2.408-3.636-4.131-6.322-4.851c-1.891-0.506-3.839-0.462-5.669,0.088C28.276,5.382,25.562,4,22.647,4	c-4.906,0-9.021,3.416-10.116,7.991c-0.01,0.001-0.019-0.003-0.029-0.002c-2.902,0.36-5.404,2.019-6.865,4.549	c-1.391,2.408-1.76,5.214-1.04,7.9c0.507,1.891,1.519,3.556,2.909,4.865c-1.134,2.666-0.97,5.714,0.484,8.234	c1.391,2.408,3.636,4.131,6.322,4.851c0.896,0.24,1.807,0.359,2.711,0.359c1.003,0,1.995-0.161,2.957-0.45	C21.722,44.619,24.425,46,27.353,46c4.911,0,9.028-3.422,10.12-8.003c2.88-0.35,5.431-2.006,6.891-4.535	C45.754,31.054,46.123,28.248,45.403,25.562z M35.17,9.543c2.171,0.581,3.984,1.974,5.107,3.919c1.049,1.817,1.243,4,0.569,5.967	c-0.099-0.062-0.193-0.131-0.294-0.19l-9.169-5.294c-0.312-0.179-0.698-0.177-1.01,0.006l-10.198,6.041l-0.052-4.607l8.663-5.001	C30.733,9.26,33,8.963,35.17,9.543z M29.737,22.195l0.062,5.504l-4.736,2.805l-4.799-2.699l-0.062-5.504l4.736-2.805L29.737,22.195z M14.235,14.412C14.235,9.773,18.009,6,22.647,6c2.109,0,4.092,0.916,5.458,2.488C28,8.544,27.891,8.591,27.787,8.651l-9.17,5.294	c-0.312,0.181-0.504,0.517-0.5,0.877l0.133,11.851l-4.015-2.258V14.412z M6.528,23.921c-0.581-2.17-0.282-4.438,0.841-6.383	c1.06-1.836,2.823-3.074,4.884-3.474c-0.004,0.116-0.018,0.23-0.018,0.348V25c0,0.361,0.195,0.694,0.51,0.872l10.329,5.81	L19.11,34.03l-8.662-5.002C8.502,27.905,7.11,26.092,6.528,23.921z M14.83,40.457c-2.171-0.581-3.984-1.974-5.107-3.919	c-1.053-1.824-1.249-4.001-0.573-5.97c0.101,0.063,0.196,0.133,0.299,0.193l9.169,5.294c0.154,0.089,0.327,0.134,0.5,0.134	c0.177,0,0.353-0.047,0.51-0.14l10.198-6.041l0.052,4.607l-8.663,5.001C19.269,40.741,17.001,41.04,14.83,40.457z M35.765,35.588	c0,4.639-3.773,8.412-8.412,8.412c-2.119,0-4.094-0.919-5.459-2.494c0.105-0.056,0.216-0.098,0.32-0.158l9.17-5.294	c0.312-0.181,0.504-0.517,0.5-0.877L31.75,23.327l4.015,2.258V35.588z M42.631,32.462c-1.056,1.83-2.84,3.086-4.884,3.483	c0.004-0.12,0.018-0.237,0.018-0.357V25c0-0.361-0.195-0.694-0.51-0.872l-10.329-5.81l3.964-2.348l8.662,5.002	c1.946,1.123,3.338,2.937,3.92,5.107C44.053,28.249,43.754,30.517,42.631,32.462z"
    />
  </svg>
);
const AnthropicIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    width="100"
    height="100"
    viewBox="0 0 48 48"
    {...props}
  >
    <path
      fill="#d19b75"
      d="M40,6H8C6.895,6,6,6.895,6,8v32c0,1.105,0.895,2,2,2h32c1.105,0,2-0.895,2-2V8	C42,6.895,41.105,6,40,6z"
    ></path>
    <path
      fill="#252525"
      d="M22.197,14.234h-4.404L10.037,33.67c0-0.096,4.452,0,4.452,0l1.484-4.069h8.234l1.58,4.069h4.261	L22.197,14.234z M17.362,26.059l2.729-6.894l2.633,6.894C22.723,26.059,17.266,26.059,17.362,26.059z"
    ></path>
    <path
      fill="#252525"
      d="M25.963,14.234L33.59,33.67h4.356l-7.803-19.436C30.144,14.234,25.963,14.186,25.963,14.234z"
    ></path>
  </svg>
);
const GoogleIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    width="100"
    height="100"
    viewBox="0 0 48 48"
    {...props}
  >
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
    <path
      fill="#FF3D00"
      d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
    ></path>
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    ></path>
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
  </svg>
);
const GrokIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    width="100"
    height="100"
    viewBox="0 0 48 48"
    {...props}
  >
    <polygon
      className="fill-gray-900 dark:fill-white"
      fillRule="evenodd"
      points="24.032,28.919 40.145,5.989 33.145,5.989 20.518,23.958"
      clipRule="evenodd"
    ></polygon>
    <polygon
      className="fill-gray-900 dark:fill-white"
      fillRule="evenodd"
      points="14.591,32.393 7.145,42.989 14.145,42.989 18.105,37.354"
      clipRule="evenodd"
    ></polygon>
    <polygon
      className="fill-gray-900 dark:fill-white"
      fillRule="evenodd"
      points="14.547,18.989 7.547,18.989 24.547,42.989 31.547,42.989"
      clipRule="evenodd"
    ></polygon>
    <polygon
      className="fill-gray-900 dark:fill-white"
      fillRule="evenodd"
      points="35,16.789 35,43 41,43 41,8.251"
      clipRule="evenodd"
    ></polygon>
  </svg>
);

const GroqIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    id="Layer_2"
    data-name="Layer 2"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200.18 69.76"
    {...props}
  >
    <g id="Layer_1-2" data-name="Layer 1">
      <path
        className="fill-[#f55036]"
        d="M114.26.13c-13.19,0-23.88,10.68-23.88,23.88s10.68,23.9,23.88,23.9,23.88-10.68,23.88-23.88h0c-.02-13.19-10.71-23.88-23.88-23.9ZM114.26,38.94c-8.24,0-14.93-6.69-14.93-14.93s6.69-14.93,14.93-14.93,14.93,6.69,14.93,14.93c-.02,8.24-6.71,14.93-14.93,14.93h0Z"
      />
      <path
        className="fill-[#f55036]"
        d="M24.11,0C10.92-.11.13,10.47,0,23.66c-.13,13.19,10.47,23.98,23.66,24.11h8.31v-8.94h-7.86c-8.24.11-15-6.5-15.1-14.74-.11-8.24,6.5-15,14.74-15.1h.34c8.22,0,14.95,6.69,14.95,14.93h0v21.98h0c0,8.18-6.65,14.83-14.81,14.93-3.91-.04-7.63-1.59-10.39-4.38l-6.33,6.31c4.4,4.42,10.34,6.92,16.57,6.99h.32c13.02-.19,23.49-10.75,23.56-23.77v-22.69C47.65,10.35,37.05.02,24.11,0Z"
      />
      <path
        className="fill-[#f55036]"
        d="M191.28,68.74V23.43c-.32-12.96-10.92-23.28-23.88-23.3-13.19-.13-23.98,10.47-24.11,23.66-.13,13.19,10.49,23.98,23.68,24.11h8.31v-8.94h-7.86c-8.24.11-15-6.5-15.1-14.74s6.5-15,14.74-15.1h.34c8.22,0,14.95,6.69,14.95,14.93h0v44.63h0l8.92.06Z"
      />
      <path
        className="fill-[#f55036]"
        d="M54.8,47.9h8.92v-23.88c0-8.24,6.69-14.93,14.93-14.93,2.72,0,5.25.72,7.46,2l4.48-7.75c-3.5-2.02-7.58-3.19-11.92-3.19-13.19,0-23.88,10.68-23.88,23.88v23.88Z"
      />
      <path
        className="fill-[#f55036]"
        d="M198.01.74c.68.38,1.21.91,1.59,1.59.38.68.57,1.42.57,2.25s-.19,1.57-.59,2.27c-.4.68-.93,1.23-1.61,1.61-.68.4-1.44.59-2.25.59s-1.57-.19-2.25-.59c-.68-.4-1.21-.93-1.59-1.61-.38-.68-.59-1.42-.59-2.25s.19-1.57.59-2.25c.38-.68.93-1.21,1.61-1.61s1.44-.59,2.27-.59c.83,0,1.57.19,2.25.59ZM197.57,7.75c.55-.32.98-.76,1.3-1.32.32-.55.47-1.17.47-1.85s-.15-1.3-.47-1.85-.74-.98-1.27-1.3c-.55-.32-1.17-.47-1.85-.47s-1.3.17-1.85.49c-.55.32-.98.76-1.3,1.32s-.47,1.17-.47,1.85.15,1.3.47,1.85c.32.55.74,1,1.27,1.32.55.32,1.15.49,1.83.49.7-.04,1.32-.21,1.87-.53ZM197.84,4.82c-.15.25-.38.45-.68.59l1.06,1.64h-1.32l-.91-1.42h-.87v1.42h-1.32V2.17h2.12c.66,0,1.19.15,1.57.47.38.32.57.74.57,1.27,0,.34-.08.66-.23.91ZM195.85,4.65c.3,0,.53-.06.68-.19.17-.13.25-.32.25-.55s-.08-.42-.25-.57-.4-.19-.68-.19h-.74v1.53h.74v-.02Z"
      />
    </g>
  </svg>
);
const OpenRouterIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    id="Layer_2"
    data-name="Layer 2"
    width="100%"
    height="100%"
    viewBox="0 0 200.18 69.76"
    xmlns="http://www.w3.org/2000/svg"
    className="size-4"
    fill="currentColor"
    stroke="currentColor"
    aria-label="Logo"
    {...props}
  >
    <g id="Layer_1-2" data-name="Layer 1">
      <path
        className="text-[#f55036]"
        d="M114.26.13c-13.19,0-23.88,10.68-23.88,23.88s10.68,23.9,23.88,23.9,23.88-10.68,23.88-23.88h0c-.02-13.19-10.71-23.88-23.88-23.9ZM114.26,38.94c-8.24,0-14.93-6.69-14.93-14.93s6.69-14.93,14.93-14.93,14.93,6.69,14.93,14.93c-.02,8.24-6.71,14.93-14.93,14.93h0Z"
      />
      <path
        className="text-[#f55036]"
        d="M24.11,0C10.92-.11.13,10.47,0,23.66c-.13,13.19,10.47,23.98,23.66,24.11h8.31v-8.94h-7.86c-8.24.11-15-6.5-15.1-14.74-.11-8.24,6.5-15,14.74-15.1h.34c8.22,0,14.95,6.69,14.95,14.93h0v21.98h0c0,8.18-6.65,14.83-14.81,14.93-3.91-.04-7.63-1.59-10.39-4.38l-6.33,6.31c4.4,4.42,10.34,6.92,16.57,6.99h.32c13.02-.19,23.49-10.75,23.56-23.77v-22.69C47.65,10.35,37.05.02,24.11,0Z"
      />
      <path
        className="text-[#f55036]"
        d="M191.28,68.74V23.43c-.32-12.96-10.92-23.28-23.88-23.3-13.19-.13-23.98,10.47-24.11,23.66-.13,13.19,10.49,23.98,23.68,24.11h8.31v-8.94h-7.86c-8.24.11-15-6.5-15.1-14.74s6.5-15,14.74-15.1h.34c8.22,0,14.95,6.69,14.95,14.93h0v44.63h0l8.92.06Z"
      />
      <path
        className="text-[#f55036]"
        d="M54.8,47.9h8.92v-23.88c0-8.24,6.69-14.93,14.93-14.93,2.72,0,5.25.72,7.46,2l4.48-7.75c-3.5-2.02-7.58-3.19-11.92-3.19-13.19,0-23.88,10.68-23.88,23.88v23.88Z"
      />
      <path
        className="text-[#f55036]"
        d="M198.01.74c.68.38,1.21.91,1.59,1.59.38.68.57,1.42.57,2.25s-.19,1.57-.59,2.27c-.4.68-.93,1.23-1.61,1.61-.68.4-1.44.59-2.25.59s-1.57-.19-2.25-.59c-.68-.4-1.21-.93-1.59-1.61-.38-.68-.59-1.42-.59-2.25s.19-1.57.59-2.25c.38-.68.93-1.21,1.61-1.61s1.44-.59,2.27-.59c.83,0,1.57.19,2.25.59ZM197.57,7.75c.55-.32.98-.76,1.3-1.32.32-.55.47-1.17.47-1.85s-.15-1.3-.47-1.85-.74-.98-1.27-1.3c-.55-.32-1.17-.47-1.85-.47s-1.3.17-1.85.49c-.55.32-.98.76-1.3,1.32s-.47,1.17-.47,1.85.15,1.3.47,1.85c.32.55.74,1,1.27,1.32.55.32,1.15.49,1.83.49.7-.04,1.32-.21,1.87-.53ZM197.84,4.82c-.15.25-.38.45-.68.59l1.06,1.64h-1.32l-.91-1.42h-.87v1.42h-1.32V2.17h2.12c.66,0,1.19.15,1.57.47.38.32.57.74.57,1.27,0,.34-.08.66-.23.91ZM195.85,4.65c.3,0,.53-.06.68-.19.17-.13.25-.32.25-.55s-.08-.42-.25-.57-.4-.19-.68-.19h-.74v1.53h.74v-.02Z"
      />
    </g>
  </svg>
);

const providersInfo: Record<
  AIProvider,
  {
    name: string;
    logo: React.ComponentType<SVGProps<SVGSVGElement>>;
    href: string;
    apiKeyName: string;
    apiKeyPlaceholder: string;
    style: {
      background: string;
      default: string;
      selected: string;
    };
  }
> = {
  openai: {
    name: "OpenAI",
    logo: OpenAIIcon,
    href: "https://platform.openai.com/api-keys",
    apiKeyName: "OpenAI API Key",
    apiKeyPlaceholder: "sk-...",
    style: {
      background: "bg-emerald-50",
      default:
        "border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800",
      selected:
        "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-950 dark:text-emerald-300",
    },
  },
  anthropic: {
    name: "Anthropic",
    logo: AnthropicIcon,
    href: "https://console.anthropic.com/",
    apiKeyName: "Anthropic API Key",
    apiKeyPlaceholder: "sk-ant-...",
    style: {
      background: "bg-orange-50",
      default:
        "border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800",
      selected:
        "border-orange-500 bg-orange-50 text-orange-700 dark:border-orange-400 dark:bg-orange-950 dark:text-orange-300",
    },
  },
  google: {
    name: "Google",
    logo: GoogleIcon,
    href: "https://aistudio.google.com/app/apikey",
    apiKeyName: "Google API Key",
    apiKeyPlaceholder: "AI...",
    style: {
      background: "bg-blue-50",
      default:
        "border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800",
      selected:
        "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-300",
    },
  },
  xai: {
    name: "xAI",
    logo: GrokIcon,
    href: "https://x.ai/",
    apiKeyName: "xAI API Key",
    apiKeyPlaceholder: "...",
    style: {
      background: "bg-gray-100",
      default:
        "border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800",
      selected:
        "border-gray-800 bg-gray-100 text-gray-900 dark:border-gray-300 dark:bg-gray-900 dark:text-gray-100",
    },
  },
  groq: {
    name: "Groq",
    logo: GroqIcon,
    href: "https://console.groq.com/keys",
    apiKeyName: "Groq API Key",
    apiKeyPlaceholder: "gsk_...",
    style: {
      background: "bg-gray-100",
      default:
        "border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800",
      selected:
        "border-orange-500 bg-orange-50 text-orange-700 dark:border-orange-400 dark:bg-orange-950 dark:text-orange-300",
    },
  },
};

export default function ApiKeysPage() {
  const user = useQuery(api.auth.loggedInUser);
  const userId = user?._id;

  // Convex integration for provider preference
  const providerPref = useQuery(
    api.settings.getProvider,
    userId ? { userId } : "skip"
  );
  const setProviderPref = useMutation(api.settings.setProvider);

  const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(
    null
  );
  const [apiKeyVisibility, setApiKeyVisibility] = useState<
    Record<AIProvider, boolean>
  >({
    openai: false,
    anthropic: false,
    google: false,
    xai: false,
    groq: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKeySection, setShowApiKeySection] = useState(false);

  // Local state for API keys and provider
  const { apiKeys, setApiKey } = useSettingsState();

  useEffect(() => {
    if (providerPref) {
      setSelectedProvider(providerPref);
    }
  }, [providerPref]);

  const handleProviderChange = (value: AIProvider) => {
    setSelectedProvider(value);
    setShowApiKeySection(true);
    if (userId) {
      void setProviderPref({ userId, provider: value });
    }
  };

  const toggleKeyVisibility = (provider: AIProvider) => {
    setApiKeyVisibility((prev) => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  };

  const handleApiKeyChange = (value: string) => {
    if (selectedProvider) {
      setApiKey(selectedProvider, value);
    }
  };

  const handleSave = () => {
    setIsSaving(true);

    // Simulate save delay and indicate success through button state
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };

  return (
    <RouteGuard>
      <div className="space-y-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">API Keys</h2>
          <p className="text-sm text-muted-foreground">
            Manage API keys for different AI providers.
          </p>
        </div>

        {/* AI Providers Section */}
        <div className="p-6 border rounded-lg shadow-sm bg-card">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="flex items-center text-xl font-medium">
                  <Key className="w-5 h-5 mr-2 text-primary" />
                  AI Providers
                </h3>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred AI provider for generating responses.
                </p>
              </div>
            </div>

            {/* Provider Selection */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {Object.entries(providersInfo).map(([key, provider]) => {
                const isSelected = selectedProvider === key;
                return (
                  <button
                    key={key}
                    type="button"
                    className={cn(
                      "flex flex-col items-center justify-center rounded-lg border p-4 text-center transition-all hover:shadow-md relative",
                      isSelected
                        ? provider.style.selected
                        : provider.style.default
                    )}
                    onClick={() => handleProviderChange(key as AIProvider)}
                  >
                    <provider.logo className="w-10 h-10 mb-3" />
                    <div className="font-medium">{provider.name}</div>
                    {isSelected && (
                      <div className="absolute flex items-center justify-center w-4 h-4 rounded-full -top-1 -right-1 bg-primary">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* API Key Management */}
        <div className="p-6 border rounded-lg shadow-sm bg-card">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="flex items-center text-xl font-medium">
                  <Key className="w-5 h-5 mr-2 text-primary" />
                  API Keys
                </h3>
                <p className="text-sm text-muted-foreground">
                  Manage API keys for various AI providers.
                </p>
              </div>
            </div>

            {selectedProvider ? (
              <div className="flex flex-col items-start gap-4 p-4 border rounded-lg md:flex-row bg-muted/30">
                <div
                  className={cn(
                    "p-3 rounded-md shrink-0",
                    providersInfo[selectedProvider].style.background
                  )}
                >
                  {selectedProvider &&
                    (() => {
                      const ProviderLogo = providersInfo[selectedProvider].logo;
                      return <ProviderLogo className="w-10 h-10" />;
                    })()}
                </div>
                <div className="flex-1 w-full">
                  <h4 className="text-lg font-medium">
                    {providersInfo[selectedProvider].name}
                  </h4>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Enter your API key to enable integration with{" "}
                    {providersInfo[selectedProvider].name}.
                  </p>

                  <div className="grid gap-4">
                    <div className="relative">
                      <Label
                        htmlFor="apiKey"
                        className="text-sm font-medium mb-1.5 block"
                      >
                        {providersInfo[selectedProvider].apiKeyName}
                      </Label>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="relative flex-1">
                          <Input
                            id="apiKey"
                            value={apiKeys[selectedProvider] || ""}
                            type={
                              apiKeyVisibility[selectedProvider]
                                ? "text"
                                : "password"
                            }
                            placeholder={
                              providersInfo[selectedProvider].apiKeyPlaceholder
                            }
                            onChange={(e) => handleApiKeyChange(e.target.value)}
                            className="pr-10 font-mono text-sm"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              toggleKeyVisibility(selectedProvider)
                            }
                            className="absolute -translate-y-1/2 right-3 top-1/2 text-muted-foreground hover:text-foreground"
                            aria-label={
                              apiKeyVisibility[selectedProvider]
                                ? "Hide API Key"
                                : "Show API Key"
                            }
                          >
                            {apiKeyVisibility[selectedProvider] ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <Button
                          type="button"
                          onClick={handleSave}
                          className="shrink-0"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4 mr-2" />
                          )}
                          Save
                        </Button>
                      </div>
                      <div className="flex flex-col justify-between gap-2 mt-2 sm:flex-row">
                        <p className="text-xs text-muted-foreground">
                          Your API key is stored securely in your browser.
                        </p>
                        <a
                          href={providersInfo[selectedProvider].href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-xs text-primary hover:underline"
                        >
                          Get API Key
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-3 h-3 ml-1"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center border rounded-lg bg-muted/30">
                <p className="text-muted-foreground">
                  Select an AI provider above to configure its API key.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
