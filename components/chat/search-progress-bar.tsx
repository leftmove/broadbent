"use client";

import { observer } from "@legendapp/state/react";
import { uiStore$ } from "state/ui";

export const SearchProgressBar = observer(() => {
  if (!uiStore$.search.isSearching.get()) {
    return null;
  }

  return (
    <div className="mb-2 px-4">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping" />
          <span>Searching the web...</span>
        </div>
        <div className="flex-1">
          <div className="w-full bg-secondary/30 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full animate-[shimmer_2s_ease-in-out_infinite]"
              style={{
                background:
                  "linear-gradient(90deg, rgb(59 130 246) 0%, rgb(37 99 235) 50%, rgb(59 130 246) 100%)",
                backgroundSize: "200% 100%",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});
