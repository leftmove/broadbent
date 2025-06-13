"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { cn } from "lib/utils";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

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
  rb: "ruby",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  fish: "bash",
  powershell: "powershell",
  ps1: "powershell",
  yml: "yaml",
  dockerfile: "docker",
  react: "jsx",
  vue: "vue",
  svelte: "svelte",
  kt: "kotlin",
  rs: "rust",
  go: "go",
  php: "php",
  c: "c",
  cpp: "cpp",
  "c++": "cpp",
  cs: "csharp",
  "c#": "csharp",
  java: "java",
  scala: "scala",
  swift: "swift",
  r: "r",
  matlab: "matlab",
  sql: "sql",
  graphql: "graphql",
  gql: "graphql",
  html: "html",
  htm: "html",
  xml: "xml",
  css: "css",
  scss: "scss",
  sass: "sass",
  less: "less",
  stylus: "stylus",
  json: "json",
  jsonc: "json",
  toml: "toml",
  ini: "ini",
  cfg: "ini",
  conf: "ini",
  env: "bash",
  gitignore: "gitignore",
  md: "markdown",
  markdown: "markdown",
  tex: "latex",
  latex: "latex",
  diff: "diff",
  patch: "diff",
  log: "log",
};

// Function to detect language from code content
const detectLanguageFromContent = (code: string): string => {
  const trimmedCode = code.trim();

  // HTML detection
  if (/<\/?\w+[^>]*>/i.test(trimmedCode)) {
    return "html";
  }

  // JavaScript/TypeScript patterns
  if (
    /(?:const|let|var)\s+\w+|function\s*\(|=>\s*{?|import\s+.*from|export\s+/i.test(
      trimmedCode
    )
  ) {
    if (
      /:\s*\w+(\[\])?(?:\s*[|&]\s*\w+(\[\])?)*\s*[=;,)]|interface\s+\w+|type\s+\w+\s*=/i.test(
        trimmedCode
      )
    ) {
      return "typescript";
    }
    return "javascript";
  }

  // Python patterns
  if (
    /def\s+\w+\s*\(|import\s+\w+|from\s+\w+\s+import|if\s+__name__\s*==\s*['"]+__main__['"]+/i.test(
      trimmedCode
    )
  ) {
    return "python";
  }

  // JSON detection
  if (
    /^\s*[{[][\s\S]*[}\]]\s*$/.test(trimmedCode) &&
    /[{}[\]":]/.test(trimmedCode)
  ) {
    try {
      JSON.parse(trimmedCode);
      return "json";
    } catch {
      // Not valid JSON
    }
  }

  // CSS detection
  if (
    /[.#]?\w+\s*\{[^}]*\}/i.test(trimmedCode) ||
    /@media|@keyframes|@import/i.test(trimmedCode)
  ) {
    return "css";
  }

  // SQL detection
  if (
    /\b(?:SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|FROM|WHERE|JOIN|GROUP BY|ORDER BY)\b/i.test(
      trimmedCode
    )
  ) {
    return "sql";
  }

  // Shell/Bash detection
  if (
    /^[#!].*(?:bash|sh|zsh)|^\s*(?:echo|cd|ls|mkdir|rm|cp|mv|grep|awk|sed)\s/im.test(
      trimmedCode
    )
  ) {
    return "bash";
  }

  return "text";
};

const normalizeLanguage = (lang: string, code?: string): string => {
  if (!lang || lang === "text") {
    // Try to detect language from code content if no language specified
    if (code) {
      const detected = detectLanguageFromContent(code);
      if (detected !== "text") {
        return detected;
      }
    }
    return "text";
  }

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
  const [copied, setCopied] = useState(false);
  const normalizedLang = normalizeLanguage(language, children);

  // Use light theme for user messages, respect system theme for assistant messages
  const syntaxTheme = isUserMessage
    ? oneLight
    : theme === "dark"
      ? oneDark
      : oneLight;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

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
      <div className="relative group">
        <button
          onClick={() => void handleCopy()}
          className={cn(
            "absolute top-3 right-3 p-1.5 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100",
            isUserMessage
              ? "bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
              : "bg-muted/50 hover:bg-muted/70 text-muted-foreground hover:text-foreground"
          )}
          title={copied ? "Copied!" : "Copy code"}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
        <SyntaxHighlighter
          language={normalizedLang}
          style={syntaxTheme}
          customStyle={{
            margin: 0,
            padding: "16px",
            paddingRight: "48px", // Make room for copy button
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
