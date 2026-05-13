import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { geistSans, geistMono, monoton } from "@/lib/fonts";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
import { getResume } from "@/lib/data";
import "./globals.css";

const { basics } = getResume();
const url = basics.links.website;
const title = `${basics.name} — Software Engineer`;
const description = `${basics.name} — senior software engineer & tech leader who values software craftsmanship and shipping work he's proud of. Portfolio built with Next.js 16.`;

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: {
    default: title,
    template: `%s · ${basics.name}`,
  },
  description,
  authors: [{ name: basics.name, url }],
  creator: basics.name,
  openGraph: {
    type: "website",
    siteName: basics.name,
    title,
    description,
    url,
    locale: "en_US",
  },
  robots: { index: true, follow: true },
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
