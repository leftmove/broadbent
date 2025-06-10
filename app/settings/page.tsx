"use client";

import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";

import { useSettingsState } from "state/settings";
import { AIProvider } from "lib/ai/types";
import {
  ArrowLeft,
  Key,
  Brain,
  Palette,
  Shield,
  Bell,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, SVGProps } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";

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
      fill-rule="evenodd"
      points="24.032,28.919 40.145,5.989 33.145,5.989 20.518,23.958"
      clip-rule="evenodd"
    ></polygon>
    <polygon
      className="fill-gray-900 dark:fill-white"
      fill-rule="evenodd"
      points="14.591,32.393 7.145,42.989 14.145,42.989 18.105,37.354"
      clip-rule="evenodd"
    ></polygon>
    <polygon
      className="fill-gray-900 dark:fill-white"
      fill-rule="evenodd"
      points="14.547,18.989 7.547,18.989 24.547,42.989 31.547,42.989"
      clip-rule="evenodd"
    ></polygon>
    <polygon
      className="fill-gray-900 dark:fill-white"
      fill-rule="evenodd"
      points="35,16.789 35,43 41,43 41,8.251"
      clip-rule="evenodd"
    ></polygon>
  </svg>
);
const OpenRouterIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
    className="size-4"
    fill="currentColor"
    stroke="currentColor"
    aria-label="Logo"
    {...props}
  >
    <g clip-path="url(#clip0_205_3)">
      <path
        d="M3 248.945C18 248.945 76 236 106 219C136 202 136 202 198 158C276.497 102.293 332 120.945 423 120.945"
        stroke-width="90"
      ></path>
      <path d="M511 121.5L357.25 210.268L357.25 32.7324L511 121.5Z"></path>
      <path
        d="M0 249C15 249 73 261.945 103 278.945C133 295.945 133 295.945 195 339.945C273.497 395.652 329 377 420 377"
        stroke-width="90"
      ></path>
      <path d="M508 376.445L354.25 287.678L354.25 465.213L508 376.445Z"></path>
    </g>
    <title style={{ display: "none" }}>OpenRouter</title>
    <defs>
      <clipPath id="clip0_205_3">
        <rect width="512" height="512" fill="white"></rect>
      </clipPath>
    </defs>
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
      default:
        "border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800",
      selected:
        "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-300",
    },
  },
  grok: {
    name: "Grok",
    logo: GrokIcon,
    href: "https://x.ai/",
    apiKeyName: "Grok API Key",
    apiKeyPlaceholder: "...",
    style: {
      default:
        "border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800",
      selected:
        "border-gray-800 bg-gray-100 text-gray-900 dark:border-gray-300 dark:bg-gray-900 dark:text-gray-100",
    },
  },
  openrouter: {
    name: "OpenRouter",
    logo: OpenRouterIcon,
    href: "https://openrouter.ai/keys",
    apiKeyName: "OpenRouter API Key",
    apiKeyPlaceholder: "sk-or-...",
    style: {
      default:
        "border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800",
      selected:
        "border-purple-500 bg-purple-50 text-purple-700 dark:border-purple-400 dark:bg-purple-950 dark:text-purple-300",
    },
  },
};

export default function SettingsPage() {
  const user = useQuery(api.auth.loggedInUser);
  const userId = user?._id;

  // Convex integration for provider preference
  const providerPref = useQuery(
    api.settings.getProvider,
    userId ? { userId } : "skip"
  );
  const setProviderPref = useMutation(api.settings.setProvider);

  // Local fallback for provider (until Convex loads)
  const { apiKeys, selectedProvider, setApiKey, setSelectedProvider } =
    useSettingsState();
  const [showKeys, setShowKeys] = useState({
    openai: false,
    anthropic: false,
    google: false,
    grok: false,
    openrouter: false,
  });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [provider, setProvider] = useState<AIProvider>(selectedProvider);

  // Sync provider from Convex when loaded
  useEffect(() => {
    if (providerPref) {
      setProvider(providerPref as AIProvider);
      setSelectedProvider(providerPref as AIProvider);
    }
  }, [providerPref, setSelectedProvider]);

  const handleProviderChange = async (value: AIProvider) => {
    console.log("Provider change triggered:", value);
    setProvider(value);
    setSelectedProvider(value);
    if (userId) {
      await setProviderPref({ userId, provider: value });
    }
  };

  const toggleKeyVisibility = (provider: AIProvider) => {
    setShowKeys((prev) => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  };

  const handleSave = () => {
    setSaveStatus("saving");

    // Simulate save delay
    setTimeout(() => {
      setSaveStatus("saved");

      // Reset to idle after showing success
      setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
    }, 500);
  };

  const hasAnyApiKey =
    apiKeys.openai ||
    apiKeys.anthropic ||
    apiKeys.google ||
    apiKeys.grok ||
    apiKeys.openrouter;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold">Settings</h1>
              <div className="text-sm text-muted-foreground">
                Manage your preferences and API configurations
              </div>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar Navigation */}
          <div className="w-64 p-6 border-r border-border">
            <nav className="space-y-2">
              <div className="space-y-1">
                <Button
                  variant="secondary"
                  className="justify-start w-full font-sans text-sm"
                >
                  <Key className="w-4 h-4 mr-3" />
                  API Keys
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start w-full font-sans text-sm text-muted-foreground"
                  disabled
                >
                  <Brain className="w-4 h-4 mr-3" />
                  AI Models
                  <span className="px-2 py-1 ml-auto text-xs rounded bg-muted">
                    Soon
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start w-full font-sans text-sm text-muted-foreground"
                  disabled
                >
                  <Palette className="w-4 h-4 mr-3" />
                  Appearance
                  <span className="px-2 py-1 ml-auto text-xs rounded bg-muted">
                    Soon
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start w-full font-sans text-sm text-muted-foreground"
                  disabled
                >
                  <Shield className="w-4 h-4 mr-3" />
                  Privacy
                  <span className="px-2 py-1 ml-auto text-xs rounded bg-muted">
                    Soon
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start w-full font-sans text-sm text-muted-foreground"
                  disabled
                >
                  <Bell className="w-4 h-4 mr-3" />
                  Notifications
                  <span className="px-2 py-1 ml-auto text-xs rounded bg-muted">
                    Soon
                  </span>
                </Button>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            <div className="max-w-2xl space-y-8">
              {/* AI Provider Selection */}
              <div className="space-y-4">
                <div>
                  <h2 className="mb-2 text-lg font-semibold">Provider</h2>
                  <div className="mb-4 text-sm text-muted-foreground">
                    Choose your preferred AI provider for generating responses.
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider">Default Provider</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {(Object.keys(providersInfo) as AIProvider[]).map(
                      (prov) => {
                        const info = providersInfo[prov];
                        const isSelected = provider === prov;
                        return (
                          <Button
                            key={prov}
                            type="button"
                            variant="outline"
                            className={`flex items-center justify-start gap-3 p-4 text-left transition-all duration-200 ${
                              isSelected
                                ? info.style.selected
                                : info.style.default
                            }`}
                            onClick={() => {
                              void handleProviderChange(prov);
                            }}
                            aria-pressed={isSelected}
                          >
                            <info.logo className="w-6 h-6" />
                            <span className="font-semibold">{info.name}</span>
                          </Button>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>

              {/* API Keys Section */}
              <div className="space-y-6">
                <div>
                  <h2 className="mb-2 text-lg font-semibold">API Keys</h2>
                  <div className="mb-4 text-sm text-muted-foreground">
                    Add your API keys to enable AI chat functionality. Keys are
                    stored locally in your browser.
                  </div>
                </div>

                {(Object.keys(providersInfo) as AIProvider[]).map((prov) => {
                  const info = providersInfo[prov];
                  return (
                    <div
                      key={prov}
                      className="p-4 space-y-3 border rounded-lg border-border"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <Label
                            htmlFor={`${prov}-key`}
                            className="text-sm font-medium"
                          >
                            {info.apiKeyName}
                          </Label>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Get your key from{" "}
                            <a
                              href={info.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline dark:text-blue-400"
                            >
                              {new URL(info.href).hostname}
                            </a>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleKeyVisibility(prov)}
                          className="text-xs"
                        >
                          {showKeys[prov] ? "Hide" : "Show"}
                        </Button>
                      </div>
                      <Input
                        id={`${prov}-key`}
                        type={showKeys[prov] ? "text" : "password"}
                        value={apiKeys[prov]}
                        onChange={(e) => setApiKey(prov, e.target.value)}
                        placeholder={info.apiKeyPlaceholder}
                        className="font-mono text-sm"
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </div>
                  );
                })}

                {/* Save Button */}
                {hasAnyApiKey && (
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSave}
                      disabled={saveStatus === "saving"}
                      className={`relative overflow-hidden transition-all duration-300 ${
                        saveStatus === "saved"
                          ? "bg-green-600 hover:bg-green-700 text-white border-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                          : ""
                      }`}
                    >
                      {saveStatus === "saving" && (
                        <span className="flex items-center">
                          <div className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin" />
                          Saving...
                        </span>
                      )}
                      {saveStatus === "saved" && (
                        <span className="flex items-center">
                          <Check className="w-4 h-4 mr-2" />
                          Saved!
                        </span>
                      )}
                      {saveStatus === "idle" && "Save Settings"}

                      {/* Green success animation overlay */}
                      {saveStatus === "saved" && (
                        <div className="absolute inset-0 bg-green-500/20 animate-pulse" />
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Security Notice */}
              <div className="overflow-hidden border border-blue-100 rounded-lg shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 dark:border-blue-800 dark:from-blue-950 dark:to-indigo-950">
                <div className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full shrink-0 dark:bg-blue-900">
                      <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-sans text-base font-medium text-blue-900 dark:text-blue-100">
                        Security Notice
                      </h3>
                      <div className="text-sm leading-relaxed text-blue-700 dark:text-blue-300">
                        Your API keys are stored locally in your browser and are
                        never sent to our servers. They are only used to make
                        direct requests to the respective AI providers.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
