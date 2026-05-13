import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { geistSans, geistMono, monoton } from "@/lib/fonts";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://arrico.me"),
  title: {
    default: "Alexander Arrico — Software Engineer",
    template: "%s · Alexander Arrico",
  },
  description:
    "Portfolio of Alexander Arrico — senior software engineer and tech leader.",
  authors: [{ name: "Alexander Arrico", url: "https://arrico.me" }],
  creator: "Alexander Arrico",
  openGraph: {
      type: "website",
      siteName: "Alexander Arrico",
      title: "Alexander Arrico — Software Engineer",
      description:
      "Portfolio of Alexander Arrico — senior software engineer and tech leader.",
      url: "https://arrico.me",
      locale: "en_US",
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${monoton.variable}`}
    >
      <body className="min-h-dvh flex flex-col">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
        <Analytics/>
      </body>
    </html>
  );
}
