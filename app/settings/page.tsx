"use client";

import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import { useSettingsState } from "state/ui/settings";
import { AIProvider } from "lib/ai/types";
import { ArrowLeft, Key, Brain, Palette, Shield, Bell, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SettingsPage() {
  const { apiKeys, selectedProvider, setApiKey, setSelectedProvider } =
    useSettingsState();
  const [showKeys, setShowKeys] = useState({
    openai: false,
    anthropic: false,
    google: false,
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const toggleKeyVisibility = (provider: keyof typeof showKeys) => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const handleSave = () => {
    setSaveStatus('saving');
    
    // Simulate save delay
    setTimeout(() => {
      setSaveStatus('saved');
      
      // Reset to idle after showing success
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }, 500);
  };

  const handleProviderChange = (value: string) => {
    console.log('Provider changed to:', value); // Debug log
    setSelectedProvider(value as AIProvider);
  };

  const hasAnyApiKey = apiKeys.openai || apiKeys.anthropic || apiKeys.google;

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
              <p className="text-sm text-muted-foreground">
                Manage your preferences and API configurations
              </p>
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
                  className="w-full justify-start font-sans text-sm"
                >
                  <Key className="w-4 h-4 mr-3" />
                  API Keys
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start font-sans text-sm text-muted-foreground"
                  disabled
                >
                  <Brain className="w-4 h-4 mr-3" />
                  AI Models
                  <span className="ml-auto text-xs bg-muted px-2 py-1 rounded">Soon</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start font-sans text-sm text-muted-foreground"
                  disabled
                >
                  <Palette className="w-4 h-4 mr-3" />
                  Appearance
                  <span className="ml-auto text-xs bg-muted px-2 py-1 rounded">Soon</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start font-sans text-sm text-muted-foreground"
                  disabled
                >
                  <Shield className="w-4 h-4 mr-3" />
                  Privacy
                  <span className="ml-auto text-xs bg-muted px-2 py-1 rounded">Soon</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start font-sans text-sm text-muted-foreground"
                  disabled
                >
                  <Bell className="w-4 h-4 mr-3" />
                  Notifications
                  <span className="ml-auto text-xs bg-muted px-2 py-1 rounded">Soon</span>
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
                  <h2 className="text-lg font-semibold mb-2">AI Provider</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose your preferred AI provider for generating responses
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider">Default Provider</Label>
                  <Select
                    value={selectedProvider}
                    onValueChange={handleProviderChange}
                  >
                    <SelectTrigger className="font-sans">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
                      <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                      <SelectItem value="google">Google (Gemini)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* API Keys Section */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">API Keys</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add your API keys to enable AI chat functionality. Keys are stored locally in your browser.
                  </p>
                </div>

                {/* OpenAI API Key */}
                <div className="space-y-3 p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="openai-key" className="text-sm font-medium">
                        OpenAI API Key
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Get your key from{" "}
                        <a
                          href="https://platform.openai.com/api-keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          platform.openai.com
                        </a>
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleKeyVisibility("openai")}
                      className="text-xs"
                    >
                      {showKeys.openai ? "Hide" : "Show"}
                    </Button>
                  </div>
                  <Input
                    id="openai-key"
                    type={showKeys.openai ? "text" : "password"}
                    value={apiKeys.openai}
                    onChange={(e) => setApiKey("openai", e.target.value)}
                    placeholder="sk-..."
                    className="font-mono text-sm"
                  />
                </div>

                {/* Anthropic API Key */}
                <div className="space-y-3 p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="anthropic-key" className="text-sm font-medium">
                        Anthropic API Key
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Get your key from{" "}
                        <a
                          href="https://console.anthropic.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          console.anthropic.com
                        </a>
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleKeyVisibility("anthropic")}
                      className="text-xs"
                    >
                      {showKeys.anthropic ? "Hide" : "Show"}
                    </Button>
                  </div>
                  <Input
                    id="anthropic-key"
                    type={showKeys.anthropic ? "text" : "password"}
                    value={apiKeys.anthropic}
                    onChange={(e) => setApiKey("anthropic", e.target.value)}
                    placeholder="sk-ant-..."
                    className="font-mono text-sm"
                  />
                </div>

                {/* Google API Key */}
                <div className="space-y-3 p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="google-key" className="text-sm font-medium">
                        Google API Key
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Get your key from{" "}
                        <a
                          href="https://aistudio.google.com/app/apikey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          aistudio.google.com
                        </a>
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleKeyVisibility("google")}
                      className="text-xs"
                    >
                      {showKeys.google ? "Hide" : "Show"}
                    </Button>
                  </div>
                  <Input
                    id="google-key"
                    type={showKeys.google ? "text" : "password"}
                    value={apiKeys.google}
                    onChange={(e) => setApiKey("google", e.target.value)}
                    placeholder="AI..."
                    className="font-mono text-sm"
                  />
                </div>

                {/* Save Button */}
                {hasAnyApiKey && (
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSave}
                      disabled={saveStatus === 'saving'}
                      className={`relative overflow-hidden transition-all duration-300 ${
                        saveStatus === 'saved' 
                          ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' 
                          : ''
                      }`}
                    >
                      {saveStatus === 'saving' && (
                        <span className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </span>
                      )}
                      {saveStatus === 'saved' && (
                        <span className="flex items-center">
                          <Check className="w-4 h-4 mr-2" />
                          Saved!
                        </span>
                      )}
                      {saveStatus === 'idle' && 'Save Settings'}
                      
                      {/* Green success animation overlay */}
                      {saveStatus === 'saved' && (
                        <div className="absolute inset-0 bg-green-500/20 animate-pulse" />
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Security Notice */}
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium mb-1">Security Notice</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your API keys are stored locally in your browser and are never sent to our servers. 
                      They are only used to make direct requests to the respective AI providers.
                    </p>
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