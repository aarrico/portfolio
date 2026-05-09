import { Geist, Geist_Mono, Monoton } from "next/font/google";

export const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const monoton = Monoton({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});
