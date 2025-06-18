import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import { ConvexClientProvider } from "components/convex-client-provider";
import { Toaster } from "sonner";
import "./globals.css";

const switzer = localFont({
  src: [
    {
      path: "./fonts/Switzer-Variable.ttf",
      style: "normal",
    },
    {
      path: "./fonts/Switzer-VariableItalic.ttf",
      style: "italic",
    },
  ],
  variable: "--font-switzer",
});
const sentient = localFont({
  src: [
    {
      path: "./fonts/Sentient-Variable.ttf",
      style: "normal",
    },
    {
      path: "./fonts/Sentient-VariableItalic.ttf",
      style: "italic",
    },
  ],
  variable: "--font-sentient",
});

export const metadata: Metadata = {
  title: "Broadbent",
  description: "A chat app with broad goals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${switzer.variable} ${sentient.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexClientProvider>
            {children}
            <Toaster />
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
