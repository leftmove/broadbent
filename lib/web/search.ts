// import { JSDOM } from "jsdom";

// function decodeDuckDuckGoURL(duckUrl: string | null): string | null {
//   if (!duckUrl) return null;

//   try {
//     const fullUrl = duckUrl.startsWith("//") ? `https:${duckUrl}` : duckUrl;
//     const url = new URL(fullUrl);
//     const uddgParam = url.searchParams.get("uddg");

//     if (uddgParam) {
//       return decodeURIComponent(uddgParam);
//     }

//     return duckUrl;
//   } catch (error) {
//     console.error("Error decoding DuckDuckGo URL:", error);
//     return duckUrl;
//   }
// }

// function cleanContentForLLM(doc: Document): string {
//   // Clone the document to avoid modifying the original
//   const clone = doc.cloneNode(true) as Document;

//   // Remove specific unwanted elements (exclusion-based approach)
//   const unwantedSelectors = [
//     "script",
//     "style",
//     'link[rel="stylesheet"]',
//     "noscript",
//     "iframe",
//     "object",
//     "embed",
//     "video",
//     "audio",
//     "canvas",
//     "svg",
//     "nav",
//     "header",
//     "footer",
//     "form",
//     "input",
//     "button",
//     "select",
//     "textarea",
//     ".advertisement",
//     ".ads",
//     ".ad",
//     ".sidebar",
//     ".menu",
//     ".navigation",
//     ".nav",
//     ".breadcrumb",
//     ".breadcrumbs",
//     ".social-share",
//     ".social-sharing",
//     ".share",
//     ".comments",
//     ".comment",
//     ".popup",
//     ".modal",
//     ".overlay",
//     ".cookie-banner",
//     ".cookie-notice",
//     ".newsletter",
//     ".subscription",
//     ".related-posts",
//     ".recommended",
//     ".tags",
//     ".categories",
//     ".metadata",
//     ".byline",
//     ".author-bio",
//     ".author-info",
//     '[role="navigation"]',
//     '[role="banner"]',
//     '[role="contentinfo"]',
//     '[role="complementary"]',
//     '[class*="ad-"]',
//     '[class*="ads-"]',
//     '[id*="ad-"]',
//     '[id*="ads-"]',
//   ];

//   // Remove unwanted elements
//   unwantedSelectors.forEach((selector) => {
//     try {
//       const elements = clone.querySelectorAll(selector);
//       elements.forEach((el) => el.remove());
//     } catch (e) {
//       console.error("Error removing unwanted elements:", e);
//     }
//   });

//   // Remove elements with specific attributes that indicate ads/tracking
//   const allElements = clone.querySelectorAll("*");
//   allElements.forEach((el) => {
//     const classList = el.className.toLowerCase();
//     const id = el.id.toLowerCase();

//     // Remove ad-related elements
//     if (
//       classList.includes("advertisement") ||
//       classList.includes("google-ad") ||
//       classList.includes("banner") ||
//       id.includes("advertisement") ||
//       id.includes("google-ad") ||
//       el.getAttribute("data-ad") ||
//       el.getAttribute("data-google-ad")
//     ) {
//       el.remove();
//       return;
//     }

//     // Clean up attributes but keep the element
//     const attributesToKeep = ["href", "alt", "title", "src"];
//     const attrs = [...el.attributes];
//     attrs.forEach((attr) => {
//       if (!attributesToKeep.includes(attr.name)) {
//         el.removeAttribute(attr.name);
//       }
//     });
//   });

//   // Work with the entire cleaned body
//   const cleanedBody = clone.body;
//   if (!cleanedBody) return "";

//   // Extract title and description first
//   const title = clone.querySelector("title")?.textContent?.trim() || "";
//   const description =
//     clone.querySelector('meta[name="description"]')?.getAttribute("content") ||
//     "";

//   // Get all text content
//   let allText = cleanedBody.textContent || "";

//   // Clean up the text
//   allText = allText
//     .replace(/\s+/g, " ") // Replace multiple whitespace with single space
//     .replace(/\n\s*\n+/g, "\n\n") // Clean up multiple newlines
//     .trim();

//   // Extract structured elements from the cleaned body
//   const headings = Array.from(
//     cleanedBody.querySelectorAll("h1, h2, h3, h4, h5, h6")
//   )
//     .map((h) => ({
//       level: parseInt(h.tagName.charAt(1)),
//       text: h.textContent?.trim() || "",
//     }))
//     .filter((h) => h.text && h.text.length > 1);

//   // Get all paragraph content
//   const paragraphs = Array.from(cleanedBody.querySelectorAll("p"))
//     .map((p) => p.textContent?.trim() || "")
//     .filter((p) => p && p.length > 5);

//   // Get content from divs and spans that contain text
//   const textContainers = Array.from(
//     cleanedBody.querySelectorAll("div, span, section, article")
//   )
//     .map((el) => {
//       // Get direct text content (not from child elements)
//       const directText = Array.from(el.childNodes)
//         .filter((node) => node.nodeType === 3) // Text nodes only
//         .map((node) => node.textContent?.trim() || "")
//         .filter((text) => text.length > 10)
//         .join(" ");
//       return directText;
//     })
//     .filter((text) => text && text.length > 15);

//   // Extract lists
//   const lists = Array.from(cleanedBody.querySelectorAll("ul, ol"))
//     .map((list) => {
//       const items = Array.from(list.querySelectorAll("li"))
//         .map((li) => li.textContent?.trim() || "")
//         .filter((item) => item && item.length > 2);
//       return items.length > 0 ? items : null;
//     })
//     .filter((list) => list);

//   // Extract blockquotes
//   const quotes = Array.from(cleanedBody.querySelectorAll("blockquote"))
//     .map((q) => q.textContent?.trim() || "")
//     .filter((q) => q && q.length > 10);

//   // Extract table content
//   const tables = Array.from(cleanedBody.querySelectorAll("table"))
//     .map((table) => {
//       const rows = Array.from(table.querySelectorAll("tr"))
//         .map((row) => {
//           const cells = Array.from(row.querySelectorAll("td, th"))
//             .map((cell) => cell.textContent?.trim() || "")
//             .filter((cell) => cell);
//           return cells.length > 0 ? cells.join(" | ") : null;
//         })
//         .filter((row) => row);
//       return rows.length > 0 ? rows : null;
//     })
//     .filter((table) => table);

//   // Build structured content
//   let structuredContent = "";

//   if (title) {
//     structuredContent += `TITLE: ${title}\n\n`;
//   }

//   if (description) {
//     structuredContent += `DESCRIPTION: ${description}\n\n`;
//   }

//   if (headings.length > 0) {
//     structuredContent += "HEADINGS:\n";
//     headings.forEach((h) => {
//       const indent = "  ".repeat(Math.max(0, h.level - 1));
//       structuredContent += `${indent}- ${h.text}\n`;
//     });
//     structuredContent += "\n";
//   }

//   if (paragraphs.length > 0) {
//     structuredContent += "PARAGRAPHS:\n";
//     paragraphs.forEach((p) => {
//       structuredContent += `${p}\n\n`;
//     });
//   }

//   if (textContainers.length > 0) {
//     structuredContent += "TEXT CONTENT:\n";
//     textContainers.forEach((text) => {
//       structuredContent += `${text}\n\n`;
//     });
//   }

//   if (lists.length > 0) {
//     structuredContent += "LISTS:\n";
//     lists.forEach((list) => {
//       list?.forEach((item) => {
//         structuredContent += `• ${item}\n`;
//       });
//       structuredContent += "\n";
//     });
//   }

//   if (quotes.length > 0) {
//     structuredContent += "QUOTES:\n";
//     quotes.forEach((quote) => {
//       structuredContent += `"${quote}"\n\n`;
//     });
//   }

//   if (tables.length > 0) {
//     structuredContent += "TABLES:\n";
//     tables.forEach((table) => {
//       table?.forEach((row) => {
//         structuredContent += `${row}\n`;
//       });
//       structuredContent += "\n";
//     });
//   }

//   // If structured content is still too short, add all text as fallback
//   if (structuredContent.length < 200 && allText.length > 50) {
//     structuredContent += "ALL TEXT CONTENT:\n";
//     structuredContent += allText.substring(0, 3000);
//   }

//   return structuredContent.trim();
// }

// async function fetchPageContent(url: string) {
//   try {
//     // Create AbortController for timeout
//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

//     const response = await fetch(url, {
//       headers: {
//         "User-Agent":
//           "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
//         Accept:
//           "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
//         "Accept-Language": "en-US,en;q=0.5",
//         "Accept-Encoding": "gzip, deflate, br",
//         Connection: "keep-alive",
//         "Upgrade-Insecure-Requests": "1",
//       },
//       signal: controller.signal,
//     });

//     clearTimeout(timeoutId);

//     if (!response.ok) {
//       throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//     }

//     const html = await response.text();
//     const dom = new JSDOM(html);
//     const doc = dom.window.document;

//     // Get cleaned content for LLM
//     const cleanedContent = cleanContentForLLM(doc);

//     // Extract basic metadata
//     const pageContent = {
//       title: doc.querySelector("title")?.textContent?.trim() || "",
//       description:
//         doc
//           .querySelector('meta[name="description"]')
//           ?.getAttribute("content") || "",
//       url: url,
//       cleanedContent: cleanedContent,
//       contentLength: cleanedContent.length,
//       // Keep raw HTML for debugging (truncated)
//       rawHtmlPreview: html.substring(0, 1000),
//     };

//     return {
//       success: true,
//       content: pageContent,
//       status: response.status,
//       error: null,
//     };
//   } catch (error) {
//     console.error(`Error fetching ${url}:`, error);
//     return {
//       success: false,
//       content: null,
//       status: null,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// }

// interface SearchResult {
//   title: string;
//   originalUrl: string;
//   url: string;
//   excerpt: string;
//   pageContent?: any;
// }

// async function searchDuckDuckGo(
//   query: string = "ai+chatbot"
// ): Promise<SearchResult[]> {
//   const html = await fetch(
//     `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`
//   ).then((r) => r.text());

//   const dom = new JSDOM(html);
//   const doc = dom.window.document;
//   const results = doc.querySelector("#links");

//   if (results) {
//     const resultLinks = results.querySelectorAll("a.result__a");

//     const searchResults = Array.from(resultLinks)
//       .map((link: Element) => {
//         const href = (link as HTMLAnchorElement).getAttribute("href");
//         const excerpt =
//           (link as HTMLAnchorElement).getAttribute("data-snippet") || "";
//         const decodedUrl = decodeDuckDuckGoURL(href);
//         const title = (link as HTMLAnchorElement).textContent?.trim();

//         return {
//           title,
//           originalUrl: href,
//           url: decodedUrl,
//           excerpt,
//         };
//       })
//       .filter((result) => result.title && result.originalUrl && result.url);

//     const resultsWithContent: SearchResult[] = [];

//     for (const result of searchResults.slice(0, 5)) {
//       const pageContent = await fetchPageContent(result.url!);

//       resultsWithContent.push({
//         title: result.title!,
//         originalUrl: result.originalUrl!,
//         url: result.url!,
//         excerpt: result.excerpt,
//         pageContent,
//       });
//     }

//     return resultsWithContent;
//   }

//   return [];
// }

// export { searchDuckDuckGo, fetchPageContent, cleanContentForLLM };
