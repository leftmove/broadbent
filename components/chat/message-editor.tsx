"use client";

import { useState } from "react";
import { Edit2, X, Save } from "lucide-react";
import { Button } from "components/ui/button";
import { Textarea } from "components/ui/textarea";
import { cn } from "lib/utils";

interface MessageEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  isDisabled: boolean;
  messageType: "user" | "assistant";
  modelInfo?: {
    provider: { name: string };
    model: { name: string };
  } | null;
}

export function MessageEditor({
  content,
  onContentChange,
  onSave,
  onCancel,
  isSaving,
  isDisabled,
  messageType,
  modelInfo,
}: MessageEditorProps) {
  return (
    <div className="w-full p-4 bg-secondary/20 rounded-xl border border-border/30 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Edit2 className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">
          Editing {messageType === "user" ? "message" : "response"}
        </span>
        {modelInfo && messageType === "assistant" && (
          <span className="text-xs text-muted-foreground">
            • {modelInfo.provider.name} {modelInfo.model.name}
          </span>
        )}
      </div>

      {/* Textarea */}
      <div className="relative">
        <Textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="w-full min-h-[120px] resize-none border-0 bg-background/50 focus:bg-background transition-all duration-200 rounded-lg font-sans text-sm leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder={messageType === "user" ? "Edit your message..." : "Edit the AI response..."}
          autoFocus
        />
        {/* Focus indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent scale-x-0 focus-within:scale-x-100 transition-transform duration-300 ease-out"></div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onSave}
          disabled={isDisabled}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
            isDisabled 
              ? "bg-muted text-muted-foreground cursor-not-allowed" 
              : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md"
          )}
        >
          {isSaving ? "Saving..." : "Save changes"}
        </button>
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}