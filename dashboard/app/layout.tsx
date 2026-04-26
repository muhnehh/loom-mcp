import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { CommandPalette } from "@/components/modals/command-palette";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "LoomMCP Dashboard",
  description: "AST-aware context compiler for coding agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className={`${inter.className} min-h-screen bg-background`}>
        <ThemeProvider>
          <div className="flex">
            <Sidebar />
            <div className="flex-1 ml-[260px]">
              <Navbar />
              <main className="min-h-[calc(100vh-64px)] overflow-x-hidden">
                {children}
              </main>
            </div>
          </div>
          <CommandPalette />
        </ThemeProvider>
      </body>
    </html>
  );
}
