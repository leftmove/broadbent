"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { cn } from "lib/utils";

interface CodeBlockProps {
  language?: string;
  children: string;
  className?: string;
  isUserMessage?: boolean;
}

const languageAliases: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  tsx: "typescript",
  jsx: "javascript",
  py: "python",
  sh: "bash",
  shell: "bash",
  yml: "yaml",
  dockerfile: "docker",
  react: "jsx",
  vue: "vue",
  svelte: "svelte",
};

const normalizeLanguage = (lang: string): string => {
  const normalized = lang.toLowerCase().trim();
  return languageAliases[normalized] || normalized;
};

export function CodeBlock({
  language = "text",
  children,
  className,
  isUserMessage = false,
}: CodeBlockProps) {
  const { theme } = useTheme();
  const normalizedLang = normalizeLanguage(language);

  // Use light theme for user messages, respect system theme for assistant messages
  const syntaxTheme = isUserMessage
    ? oneLight
    : theme === "dark"
      ? oneDark
      : oneLight;

  return (
    <div
      className={cn(
        "my-2 rounded-md overflow-hidden border text-sm",
        isUserMessage
          ? "border-primary-foreground/20 bg-primary-foreground/5"
          : "border-border bg-muted/30",
        className
      )}
    >
      {language && language !== "text" && (
        <div
          className={cn(
            "px-3 py-1.5 text-xs font-medium border-b",
            isUserMessage
              ? "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground/80"
              : "bg-muted/50 border-border text-muted-foreground"
          )}
        >
          {language}
        </div>
      )}
      <div className="relative">
        <SyntaxHighlighter
          language={normalizedLang}
          style={syntaxTheme}
          customStyle={{
            margin: 0,
            padding: "16px",
            fontSize: "13px",
            lineHeight: "1.4",
            backgroundColor: "transparent",
            fontFamily:
              "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
          }}
          wrapLines={true}
          wrapLongLines={true}
          showLineNumbers={false}
          codeTagProps={{
            style: {
              fontFamily: "inherit",
              fontSize: "inherit",
            },
          }}
        >
          {children.trim()}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
