"use client";

import { Doc } from "convex/_generated/dataModel";
import { cn } from "lib/utils";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  message: Doc<"messages">;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className="flex w-full px-4">
      <div
        className={cn(
          "rounded-lg px-4 py-3 max-w-[85%] break-words",
          isUser
            ? "bg-primary text-primary-foreground ml-auto"
            : "bg-secondary text-secondary-foreground mr-auto"
        )}
      >
        <div
          className={cn(
            "prose prose-sm max-w-none break-words overflow-wrap-anywhere",
            isUser
              ? "prose-invert text-primary-foreground [&_*]:text-primary-foreground"
              : "text-secondary-foreground [&_*]:text-secondary-foreground"
          )}
        >
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="mb-3 leading-relaxed last:mb-0 break-words">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold">{children}</strong>
              ),
              em: ({ children }) => <em className="italic">{children}</em>,
              code: ({ children }) => (
                <code
                  className={cn(
                    "px-1.5 py-0.5 rounded text-sm font-mono break-all",
                    isUser
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre
                  className={cn(
                    "p-3 rounded-md mt-2 mb-2 overflow-x-auto font-mono text-sm whitespace-pre-wrap break-words",
                    isUser
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {children}
                </pre>
              ),
              ul: ({ children }) => (
                <ul className="mb-3 space-y-1 list-disc list-inside last:mb-0">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-3 space-y-1 list-decimal list-inside last:mb-0">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed break-words">{children}</li>
              ),
              blockquote: ({ children }) => (
                <blockquote
                  className={cn(
                    "border-l-4 pl-4 py-2 my-3 italic break-words",
                    isUser
                      ? "border-primary-foreground/30"
                      : "border-muted-foreground/30"
                  )}
                >
                  {children}
                </blockquote>
              ),
              a: ({ children, href }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "underline hover:no-underline transition-colors break-all",
                    isUser
                      ? "text-primary-foreground hover:text-primary-foreground/80"
                      : "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  )}
                >
                  {children}
                </a>
              ),
              h1: ({ children }) => (
                <h1 className="mt-4 mb-3 text-xl font-bold first:mt-0 break-words">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="mt-3 mb-2 text-lg font-bold first:mt-0 break-words">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="mt-3 mb-2 text-base font-bold first:mt-0 break-words">
                  {children}
                </h3>
              ),
              hr: () => (
                <hr
                  className={cn(
                    "my-4 border-t",
                    isUser
                      ? "border-primary-foreground/30"
                      : "border-muted-foreground/30"
                  )}
                />
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}