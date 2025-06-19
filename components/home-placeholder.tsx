"use client";
import { useState, useEffect } from "react";

import { Sparkles, BrainCircuit, Compass, Telescope } from "lucide-react";
import { headerPhrase } from "lib/phrases";
import { cn } from "lib/utils";
import { useUIState } from "state/ui";
import { ChatInput } from "components/chat/chat-input";
import { SearchProgressBar } from "components/chat/search-progress-bar";

export function HomePlaceholder() {
  const [prompt, setPrompt] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { inputHasContent, setInputHasContent } = useUIState();

  useEffect(() => {
    setInputHasContent(false);
  }, []);

  const handlePromptClick = (text: string) => {
    setPrompt(text);
  };

  const handlePromptHandled = () => {
    setPrompt("");
  };

  const handleChatStart = () => {
    setIsTransitioning(true);
  };

  return (
    <div className="relative flex flex-col items-center justify-center flex-1 px-4">
      <h3
        className={`mb-4 font-serif text-lg font-bold opacity-30 transition-all duration-300 ease-out ${
          isTransitioning ? "transform -translate-y-8 opacity-0" : ""
        }`}
      >
        Broadbent
      </h3>
      <div className="w-full mx-auto space-y-8 text-center">
        <div
          className={`space-y-6 opacity-0 animate-pop-in transition-all duration-300 ease-out ${
            isTransitioning || inputHasContent
              ? "transform -translate-y-12 opacity-0"
              : ""
          }`}
        >
          <h1
            className={cn(
              "font-sans text-4xl font-semibold text-foreground",
              inputHasContent ? "opacity-0 -translate-y-16" : "translate-y-0"
            )}
          >
            {headerPhrase()}
          </h1>
        </div>

        <div
          className={`grid w-full max-w-2xl grid-cols-1 gap-4 mx-auto font-serif md:grid-cols-2 transition-all duration-300 ease-out ${
            inputHasContent ? "opacity-0 transform -translate-y-8" : ""
          }`}
        >
          <button
            onClick={() =>
              handlePromptClick(
                "What are some emerging technologies I should learn about?"
              )
            }
            className="p-5 text-left transition-all duration-200 border shadow-sm opacity-0 border-border rounded-2xl hover:bg-secondary/30 group hover:shadow-md animate-pop-in-delay-1"
          >
            <div className="flex items-center h-16 space-x-3">
              <div className="text-lg">
                <Telescope className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">
                  Search
                </div>
                <div className="font-sans text-xs leading-relaxed text-muted-foreground">
                  Traverse the web to find more current and specific context.
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() =>
              handlePromptClick(
                "Help me break down a complex problem I'm facing with my project."
              )
            }
            className="p-5 text-left transition-all duration-200 border shadow-sm opacity-0 border-border rounded-2xl hover:bg-secondary/30 group hover:shadow-md animate-pop-in-delay-1"
          >
            <div className="flex items-center h-16 space-x-3">
              <div className="text-lg">
                <BrainCircuit className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">Think</div>
                <div className="font-sans text-xs leading-relaxed text-muted-foreground">
                  Reason with complex problems to get more accurate answers.
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => {}}
            className="relative p-5 overflow-hidden text-left transition-all duration-200 border shadow-sm opacity-0 border-border rounded-2xl hover:bg-secondary/30 group hover:shadow-md animate-pop-in-delay-2"
          >
            <div className="flex items-center h-16 space-x-3">
              <div className="text-lg">
                <Sparkles className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">
                  Imagine
                </div>
                <div className="font-sans text-xs leading-relaxed text-muted-foreground">
                  Write a thousand words at once with image generation.
                </div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 opacity-0 bg-background/90 backdrop-blur-sm group-hover:opacity-100">
              <span className="px-3 py-1 text-xs font-medium border rounded-full text-muted-foreground border-border">
                Coming Soon
              </span>
            </div>
          </button>

          <button
            onClick={() => {}}
            className="relative p-5 overflow-hidden text-left transition-all duration-200 border shadow-sm opacity-0 border-border rounded-2xl hover:bg-secondary/30 group hover:shadow-md animate-pop-in-delay-2"
          >
            <div className="flex items-center h-16 space-x-3">
              <div className="text-lg">
                <Compass className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">
                  Assist
                </div>
                <div className="font-sans text-xs leading-relaxed text-muted-foreground">
                  Navigate your browser with an extra helping hand.
                </div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 opacity-0 bg-background/90 backdrop-blur-sm group-hover:opacity-100">
              <span className="px-3 py-1 text-xs font-medium border rounded-full text-muted-foreground border-border">
                Coming Soon
              </span>
            </div>
          </button>
        </div>

        <div
          className={`max-w-lg mx-auto space-y-4 font-sans text-sm opacity-0 animate-pop-in-delay-3 transition-all duration-300 ease-out ${
            isTransitioning || inputHasContent
              ? "transform -translate-y-16 opacity-0"
              : ""
          }`}
        >
          <button
            onClick={() => handlePromptClick("How does AI work?")}
            className={cn(
              "block w-full px-4 py-3 opacity-100 transition-all duration-300 text-left rounded-xl hover:bg-secondary/30 text-muted-foreground",
              inputHasContent ? "opacity-0 translate-y-16" : ""
            )}
            disabled={isTransitioning}
          >
            How does AI work?
          </button>
          <button
            onClick={() => handlePromptClick("Are black holes real?")}
            className={cn(
              "block w-full px-4 py-3 opacity-100 transition-all duration-300 text-left rounded-xl hover:bg-secondary/30 text-muted-foreground",
              inputHasContent ? "opacity-0 translate-y-16" : ""
            )}
            disabled={isTransitioning}
          >
            Are black holes real?
          </button>
          <button
            onClick={() =>
              handlePromptClick('How many Rs are in the word "strawberry"?')
            }
            className={cn(
              "block w-full px-4 py-3 opacity-100 transition-all duration-300 text-left rounded-xl hover:bg-secondary/30 text-muted-foreground",
              inputHasContent ? "opacity-0 translate-y-16" : ""
            )}
            disabled={isTransitioning}
          >
            How many Rs are in the word "strawberry"?
          </button>
          <button
            onClick={() => handlePromptClick("What is the meaning of life?")}
            className={cn(
              "block w-full px-4 py-3 opacity-100 transition-all duration-300 text-left rounded-xl hover:bg-secondary/30 text-muted-foreground",
              inputHasContent ? "opacity-0 translate-y-16" : ""
            )}
            disabled={isTransitioning}
          >
            What is the meaning of life?
          </button>
        </div>

        <div
          className={`relative z-10 max-w-4xl mx-auto transition-all duration-500 ease-in-out opacity-0 animate-pop-in-delay-3 ${
            isTransitioning ? "transform translate-y-4 scale-105" : ""
          }`}
        >
          <SearchProgressBar />
          <ChatInput 
            chatSlug="" 
            isHomepage={true} 
            className="p-3" 
            defaultValue={prompt}
            onPromptHandled={handlePromptHandled}
          />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-[0.5px] h-full bg-border"></div>
    </div>
  );
}
