"use client";

import { JSX, useLayoutEffect, useEffect, useState } from "react";
// import { highlight } from "components/highlight";
import { GuessLang } from "guesslang-js";

function extractCodeString(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) {
    return children.map(extractCodeString).join("");
  }
  return "";
}

// export function Syntax({ initial }: { initial?: JSX.Element }) {
//   const [nodes, setNodes] = useState(initial);

//   useLayoutEffect(() => {
//     void highlight('console.log("Rendered on client")', "ts").then(setNodes);
//   }, []);

//   return nodes ?? <span>Loading...</span>;
// }

// export function Code({ children }: { children: React.ReactNode }) {
//   const [highlighted, setHighlighted] = useState<JSX.Element | null>(null);

//   useEffect(() => {
//     void highlight('console.log("Rendered on client")', "ts").then(
//       setHighlighted
//     );
//   }, []);

//   return highlighted ? (
//     <Syntax initial={highlighted} />
//   ) : (
//     <span>Loading...</span>
//   );
// }

import { createHighlighter } from "shiki";

const highlighter = createHighlighter({
  themes: ["github-dark", "github-light"],
  langs: ["ts", "js", "jsx", "tsx", "json", "html", "css", "md"],
});

export function Code({ children }: { children: React.ReactNode }) {
  const code = extractCodeString(children);
  const [highlighted, setHighlighted] = useState<string | null>(null);

  useEffect(() => {
    async function detectLanguage(code: string): Promise<string> {
      const guessLang = new GuessLang();
      const result = await guessLang.runModel(code);
      return result[0].languageId;
    }
    async function processCode() {
      const language = await detectLanguage(code);
      const highlighted = (await highlighter).codeToHtml(code, {
        lang: language,
        themes: {
          light: "github-light",
          dark: "github-dark",
        },
      });

      setHighlighted(highlighted);
    }
    void processCode();
  }, [code]);

  return <span>hey</span>;
}
