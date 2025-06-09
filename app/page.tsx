import { ChatInterface } from "components/chat-interface";

export default function Home() {
  return (
    <main className="min-h-screen bg-background antialiased">
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20"></div>
        <div className="relative">
          <ChatInterface />
        </div>
      </div>
    </main>
  );
}
