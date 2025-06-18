"use client";

import { useState } from "react";
import { ExternalLink, Globe, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "lib/utils";

interface MessageSource {
  title: string;
  url: string;
  excerpt?: string;
}

interface MessageSourcesProps {
  sources: MessageSource[];
  className?: string;
}

export function MessageSources({ sources, className }: MessageSourcesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) {
    return null;
  }

  // Filter out sources with no excerpt and Google Vertex AI search URLs
  const validSources = sources.filter(source => {
    // Skip if no excerpt
    if (!source.excerpt || source.excerpt.trim() === "" || source.excerpt === "No excerpt available") {
      return false;
    }
    
    // Skip Google Vertex AI search URLs that aren't real links
    if (source.url.includes("vertexaisearch.cloud.google.com")) {
      return false;
    }
    
    return true;
  });

  if (validSources.length === 0) {
    return null;
  }

  return (
    <div className={cn("mt-4 space-y-2", className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span>Web Sources ({validSources.length})</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      
      <div className={cn(
        "transition-all duration-300 ease-in-out overflow-hidden",
        isExpanded ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="overflow-y-auto max-h-[400px] pt-1 pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {validSources.map((source, index) => (
              <a
                key={index}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-2 p-3 text-sm transition-colors duration-200 border rounded-lg border-border/30 bg-secondary/20 hover:bg-secondary/30 hover:border-border/50 group"
              >
                <div className="flex items-start gap-2">
                  <ExternalLink className="w-3 h-3 mt-0.5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                  <div className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 text-xs leading-relaxed">
                    {source.title}
                  </div>
                </div>
                <div className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                  {source.excerpt}
                </div>
                <div className="text-xs text-muted-foreground/60 truncate">
                  {new URL(source.url).hostname}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}