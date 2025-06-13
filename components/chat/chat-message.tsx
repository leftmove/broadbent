"use client";

import { Doc } from "convex/_generated/dataModel";
import ReactMarkdown from "react-markdown";

import { cn } from "lib/utils";
import { CodeBlock } from "components/code-block";

interface ChatMessageProps {
  message: Doc<"messages">;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  if (isUser) {
    // User messages: bubble style on the right
    return (
      <div className="flex w-full justify-end px-4 py-2">
        <div className="rounded-lg px-3 py-2 max-w-[80%] break-words bg-primary text-primary-foreground">
          <div className="text-sm leading-relaxed">{message.content}</div>
        </div>
      </div>
    );
  }

  // AI messages: plain text on background, no bubble
  return (
    <div className="flex w-full px-4 py-2">
      <div className="w-full max-w-none break-words">
        <div className="prose prose-sm max-w-none break-words text-foreground [&_*]:text-foreground">
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="mb-3 leading-relaxed break-words last:mb-0">
                  {children}
                </p>
              ),
              code: ({ children, className, ...props }) => {
                const match = /language-(\w+)/.exec(className || "");
                const language = match ? match[1] : "";

                const codeContent = Array.isArray(children)
                  ? children
                      .filter((child) => typeof child === "string")
                      .join("")
                  : typeof children === "string"
                    ? children
                    : "";

                if (language) {
                  return (
                    <CodeBlock language={language} isUserMessage={false}>
                      {codeContent.replace(/\n$/, "")}
                    </CodeBlock>
                  );
                }

                return (
                  <code
                    className="px-1.5 py-0.5 rounded text-sm font-mono break-words bg-muted text-muted-foreground"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => {
                return <>{children}</>;
              },
              strong: ({ children }) => (
                <strong className="font-semibold">{children}</strong>
              ),
              em: ({ children }) => <em className="italic">{children}</em>,
              ul: ({ children }) => (
                <ul className="mb-3 space-y-1 list-disc list-inside last:mb-0 pl-2">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-3 space-y-1 list-decimal list-inside last:mb-0 pl-2">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed break-words">{children}</li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 pl-4 py-2 my-3 italic break-words border-muted-foreground/30">
                  {children}
                </blockquote>
              ),
              a: ({ children, href }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline transition-colors break-all text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {children}
                </a>
              ),
              h1: ({ children }) => (
                <h1 className="mt-4 mb-3 text-xl font-bold break-words first:mt-0">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="mt-3 mb-2 text-lg font-bold break-words first:mt-0">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="mt-3 mb-2 text-base font-bold break-words first:mt-0">
                  {children}
                </h3>
              ),
              hr: () => (
                <hr className="my-4 border-t border-muted-foreground/30" />
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
