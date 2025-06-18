"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Brain, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { cn } from "lib/utils";
import { Id } from "convex/_generated/dataModel";

interface ThinkingDisplayProps {
  thinking: string;
  messageId: Id<"messages">;
  className?: string;
}

export function ThinkingDisplay({
  thinking,
  messageId,
  className,
}: ThinkingDisplayProps) {
  const [showReasoning, setShowReasoning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasAutoCollapsed, setHasAutoCollapsed] = useState(false);

  const isGenerating = useQuery(api.generations.isGenerating, { messageId });

  // Auto-expand when reasoning starts, auto-collapse when done
  useEffect(() => {
    if (thinking && thinking.trim() !== "") {
      if (isGenerating) {
        // Expand when generating (only if not already expanded)
        if (!showReasoning) {
          setShowReasoning(true);
        }
      } else if (!hasAutoCollapsed) {
        // Auto-collapse when generation is complete (only once)
        setShowReasoning(false);
        setHasAutoCollapsed(true);
      }
    }
  }, [thinking, isGenerating, hasAutoCollapsed, showReasoning]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(thinking);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy reasoning: ", err);
    }
  };

  if (!thinking || thinking.trim() === "") {
    return null;
  }

  return (
    <div className={cn("mt-4 border-t border-border/20 pt-4", className)}>
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            setShowReasoning(!showReasoning);
          }}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-200 border border-transparent rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 hover:border-border/50"
        >
          <Brain className="w-4 h-4" />
          <span>Reasoning</span>
          {showReasoning ? (
            <ChevronUp className="w-4 h-4 ml-1" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-1" />
          )}
        </button>

        {showReasoning && (
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs transition-all duration-200 text-muted-foreground hover:text-foreground hover:scale-105 active:scale-95 rounded-full hover:bg-secondary/30"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span className="font-medium">Copy</span>
          </button>
        )}
      </div>

      {
        <div
          className={cn(
            "p-4 mt-3 duration-200 transition-all border rounded-lg bg-secondary/30 border-border/30 animate-in slide-in-from-top-2",
            showReasoning
              ? "max-h-72 overflow-scroll"
              : "max-h-0 p-0 overflow-hidden"
          )}
        >
          <div className="font-mono text-sm prose-sm prose max-w-none text-muted-foreground">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="mb-2 leading-relaxed break-words last:mb-0">
                    {children}
                  </p>
                ),
                code: ({ children }) => (
                  <code className="px-1 py-0.5 rounded text-xs bg-muted/50">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="p-2 mt-2 mb-2 overflow-x-auto rounded bg-muted/30">
                    {children}
                  </pre>
                ),
                ul: ({ children }) => (
                  <ul className="pl-4 mb-2 space-y-1 list-disc last:mb-0">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="pl-4 mb-2 space-y-1 list-decimal last:mb-0">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed break-words">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground/90">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-foreground/80">{children}</em>
                ),
              }}
            >
              {thinking}
            </ReactMarkdown>
          </div>
        </div>
      }
    </div>
  );
}
