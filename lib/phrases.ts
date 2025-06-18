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

export function inputPhrase() {
  return INPUT_PHRASES[Math.floor(Math.random() * INPUT_PHRASES.length)];
}
