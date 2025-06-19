const INPUT_PHRASES = [
  "Words optional.",
  "Fill me up.",
  "Blank.",
  "One bad idea away.",
  "Nothing says intimacy like plaintext.",
  "Go ahead, complicate things.",
  "Mean more.",
  "What's the worst that could happen?",
  "Mistakes start here.",
  "Go on.",
  "Use your words.",
  "Use your inside voice.",
  "Might as well.",
  "You know what to do.",
  "Put a thought in the box.",
  "Scene: Unwritten.",
  "Get your fill.",
  "Don't make it weird.",
  "Is this thing on?",
  "Where words might go.",
  "Blank space. Big potential.",
];

export const HEADER_PHRASES = [
  "How can I help you today?",
  "Ask me anything.",
  "You first.",
  "What's next?",
  "Now what?",
  "Turing complete.",
  "Conversation pending.",
  "Talk is cheap. Typing is cheaper.",
  "I promise not to ask about crosswalks.",
  "This is easier than finding traffic lights.",
  "It begins.",
  "Holding for words.",
  "We start from nothing.",
  "Prompt not included.",
  "All quiet on the input front.",
  "On the edge of meaning.",
  "One message away.",
  "Speechless, by design.",
  "The calm before the reply.",
  "Nothing yet. But almost.",
  "This could be the start.",
];

export function inputPhrase() {
  return INPUT_PHRASES[Math.floor(Math.random() * INPUT_PHRASES.length)];
}

export function headerPhrase() {
  return HEADER_PHRASES[Math.floor(Math.random() * HEADER_PHRASES.length)];
}
