import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "data-vault — Your apps. Your data. Zero server headaches.",
  description:
    "Self-host Immich, Nextcloud, and more through a simple app store. No terminal. No YAML. No technical knowledge required. Join the waitlist.",
  openGraph: {
    title: "data-vault — Your apps. Your data. Zero server headaches.",
    description:
      "Self-host your favourite open source apps without touching a server. Privacy-first, built for non-technical people.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${dmSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#080810]">{children}</body>
    </html>
  );
}
