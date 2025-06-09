import "./globals.css";
import { ConvexProvider } from "components/providers/convex-provider";
import { ThemeProvider } from "components/providers/theme-provider";

export const metadata = {
  title: "Broadbent",
  description: "Broadbent",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen text-gray-900 bg-white">
        <ThemeProvider>
          <ConvexProvider>{children}</ConvexProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
