<div style="display: flex; flex-direction: column; align-items: center; margin: 40px auto 20px auto; width: 66.66%;">
  <image src="https://i.imgur.com/dIolunV.png" alt="Broadbent" />
  <span style="margin-top: 20px;">A chat app with broad goals.</span>
</div>

## Features

- **Real-time Chat**: Instant messaging with responsive UI
- **AI Integration**: Multiple AI providers (OpenAI, Anthropic, Google, Groq, xAI)
- **User Authentication**: Secure sign-up, sign-in, and password reset
- **Theme Support**: Light and dark mode with system preference detection
- **Chat Management**: Create, organize, and delete conversations
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **API Key Management**: Secure storage and management of AI provider keys

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Convex (real-time database and backend functions)
- **Authentication**: Convex Auth
- **AI Integration**: Multiple provider support with unified interface
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd broadbent
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Set up Convex**

   ```bash
   bunx convex dev
   ```

4. **Start the development server**

   ```bash
   bun dev
   ```

5. **Configure AI providers** (optional)
   - Navigate to Settings → API Keys
   - Add your API keys for desired AI providers

## Project Structure

```
broadbent/
├── app/                 # Next.js app router pages
├── components/          # Reusable React components
├── convex/             # Convex backend functions and schema
├── lib/                # Utility functions and AI integration
├── state/              # Global state management
└── public/             # Static assets
```

## Development

The project uses modern development practices:

- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling
- Convex for real-time backend functionality
