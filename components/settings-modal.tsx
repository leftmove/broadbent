"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog";
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

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { apiKeys, selectedProvider, setApiKey, setSelectedProvider } =
    useSettingsState();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider">AI Provider</Label>
            <Select
              value={selectedProvider}
              onValueChange={(value) =>
                setSelectedProvider(value as AIProvider)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="google">Google Gemini</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="openai-key">OpenAI API Key</Label>
            <Input
              id="openai-key"
              type="password"
              value={apiKeys.openai}
              onChange={(e) => setApiKey("openai", e.target.value)}
              placeholder="sk-..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="anthropic-key">Anthropic API Key</Label>
            <Input
              id="anthropic-key"
              type="password"
              value={apiKeys.anthropic}
              onChange={(e) => setApiKey("anthropic", e.target.value)}
              placeholder="sk-ant-..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="google-key">Google API Key</Label>
            <Input
              id="google-key"
              type="password"
              value={apiKeys.google}
              onChange={(e) => setApiKey("google", e.target.value)}
              placeholder="AI..."
            />
          </div>

          <Button onClick={() => onOpenChange(false)} className="w-full">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
