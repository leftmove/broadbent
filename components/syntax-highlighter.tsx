"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  isUserMessage?: boolean;
}

const languageAliases: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  sh: "bash",
  yml: "yaml",
  dockerfile: "docker",
  react: "jsx",
  vue: "vue",
  svelte: "svelte",
};

const normalizeLanguage = (lang: string): string => {
  const normalized = lang.toLowerCase();
  return languageAliases[normalized] || normalized;
};

export function CodeBlock({
  code,
  language = "text",
  className,
  isUserMessage = false,
}: CodeBlockProps) {
  const normalizedLang = normalizeLanguage(language);
  const theme = isUserMessage ? oneLight : oneDark;

  return (
    <div
      className={cn(
        "mt-2 mb-2 rounded-md overflow-hidden border max-w-full",
        isUserMessage ? "border-primary-foreground/20" : "border-border",
        className
      )}
    >
      <SyntaxHighlighter
        language={normalizedLang}
        style={theme}
        customStyle={{
          margin: 0,
          padding: "12px",
          fontSize: "14px",
          lineHeight: "1.5",
          backgroundColor: "transparent",
          maxWidth: "100%",
          overflow: "auto",
        }}
        codeTagProps={{
          style: {
            fontFamily:
              "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
            fontSize: "14px",
          },
        }}
        wrapLines={true}
        wrapLongLines={true}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
