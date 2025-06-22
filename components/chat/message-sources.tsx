"use client";

import { useState } from "react";
import { ExternalLink, ChevronRight } from "lucide-react";
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
  const validSources = sources.filter((source) => {
    // Skip if no excerpt
    if (
      !source.excerpt ||
      source.excerpt.trim() === "" ||
      source.excerpt === "No excerpt available"
    ) {
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
    <div className={cn("mt-6", className)}>
      <div className="flex justify-end mb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="group flex items-center gap-2 text-xs font-medium text-muted-foreground/70 hover:text-muted-foreground transition-all duration-200"
        >
          <span className="tracking-wide uppercase">Sources</span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-normal">
              ({validSources.length})
            </span>
            <ChevronRight
              className={cn(
                "w-3 h-3 transition-transform duration-200",
                isExpanded && "rotate-90"
              )}
            />
          </div>
        </button>
      </div>

      <div
        className={cn(
          "transition-all duration-300 ease-out overflow-hidden",
          isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {validSources.map((source, index) => (
            <a
              key={index}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-3 text-right border-l-2 border-border/20 hover:border-primary/30 bg-secondary/10 hover:bg-secondary/20 transition-all duration-200 rounded-r-md"
            >
              <div className="flex items-start justify-end gap-2 mb-1.5">
                <div className="text-right">
                  <div className="text-xs font-medium text-foreground/90 group-hover:text-foreground line-clamp-2 leading-relaxed">
                    {source.title}
                  </div>
                  <div className="text-[10px] text-muted-foreground/60 mt-0.5 tracking-wide">
                    {new URL(source.url).hostname.replace("www.", "")}
                  </div>
                </div>
                <ExternalLink className="w-3 h-3 mt-0.5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
              </div>
              {source.excerpt && (
                <div className="text-[11px] text-muted-foreground/70 line-clamp-2 leading-relaxed text-right font-light">
                  {source.excerpt}
                </div>
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
