"use client";

import { memo, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Calendar } from "lucide-react";
import { cn } from "lib/utils";

interface SearchResult {
  _id: string;
  content: string;
  role: "user" | "assistant" | "system";
  _creationTime: number;
  chatId: string;
  chat: {
    _id: string;
    slug: string;
    title: string;
    _creationTime: number;
  } | null;
}

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  className?: string;
}

export const SearchResults = memo(function SearchResults({
  results,
  query,
  className,
}: SearchResultsProps) {
  const router = useRouter();

  const handleResultClick = (result: SearchResult) => {
    if (result.chat) {
      router.push(`/c/${result.chat.slug}#${result._id}`);
    }
  };

  const highlightText = useMemo(
    () => (text: string, query: string) => {
      if (!query.trim()) return text;

      const regex = new RegExp(
        `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi"
      );
      const parts = text.split(regex);

      return parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="bg-primary/20 text-primary-foreground bg-primary/80 rounded-sm px-1 py-0.5 font-semibold shadow-sm"
          >
            {part}
          </mark>
        ) : (
          part
        )
      );
    },
    [query]
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  if (results.length === 0) {
    return (
      <div className={cn("px-3 py-8 text-center", className)}>
        <MessageSquare className="mx-auto mb-2 w-8 h-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No messages found</p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Try different keywords or check your spelling
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {results.map((result) => (
        <button
          key={result._id}
          onClick={() => handleResultClick(result)}
          className="overflow-hidden relative p-3 w-full text-left rounded-xl border border-transparent transition-all duration-200 hover:bg-secondary/50 group hover:border-border/30 hover:shadow-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent opacity-0 transition-opacity duration-200 via-primary/5 group-hover:opacity-100"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-1 items-center space-x-2 min-w-0">
                <div
                  className={cn(
                    "w-2.5 h-2.5 rounded-full shrink-0 shadow-sm border border-white/20",
                    result.role === "user" ? "bg-blue-500" : "bg-green-500"
                  )}
                />
                <span className="text-xs font-semibold capitalize text-foreground/80">
                  {result.role}
                </span>
                {result.chat && (
                  <>
                    <span className="text-muted-foreground/40">•</span>
                    <span className="text-xs font-medium truncate text-muted-foreground/80">
                      {result.chat.title}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground/60 shrink-0 ml-2 bg-secondary/30 px-2 py-0.5 rounded-full">
                <Calendar className="w-3 h-3" />
                <span className="font-medium">
                  {formatDate(result._creationTime)}
                </span>
              </div>
            </div>

            <div className="text-sm font-medium leading-relaxed text-foreground/90 line-clamp-3">
              {highlightText(result.content, query)}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
});
