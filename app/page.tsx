import { RouteGuard } from "components/route-guard";
import { ChatInterface } from "components/chat-interface";
import { HomePlaceholder } from "components/home-placeholder";

export default function Home() {
  return (
    <RouteGuard>
      <ChatInterface>
        <HomePlaceholder />
      </ChatInterface>
    </RouteGuard>
  );
}
