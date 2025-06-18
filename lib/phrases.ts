const INPUT_PHRASES = [
  "Words optional.",
  "Talk is cheap. Typing is cheaper.",
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
  "This is the way.",
  "Ask me anything.",
];

export const HEADER_PHRASES = [
  "How can I help you today?",
  "Is this thing on?",
  "You first.",
  "Conversation pending.",
  "It begins.",
  "Holding for words.",
  "We start from nothing.",
  "Blank space. Big potential.",
  "Prompt not included.",
  "Scene: Unwritten.",
  "All quiet on the input front.",
  "On the edge of meaning.",
  "Where words might go.",
  "One message away.",
  "Speechless, by design.",
  "The calm before the reply.",
  "Nothing yet. But almost.",
  "Right before relevance.",
  "This could be the start.",
];

export function inputPhrase() {
  return INPUT_PHRASES[Math.floor(Math.random() * INPUT_PHRASES.length)];
}

export function headerPhrase() {
  return HEADER_PHRASES[Math.floor(Math.random() * HEADER_PHRASES.length)];
}
