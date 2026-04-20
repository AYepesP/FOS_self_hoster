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
  title: "Almerno — Your apps. Your data. Big Tech doesn't get a vote.",
  description:
    "Self-host Immich, Nextcloud, Vaultwarden, and more through a simple app store. No terminal. No YAML. No IT degree. Join the waitlist.",
  openGraph: {
    title: "Almerno — Your apps. Your data. Big Tech doesn't get a vote.",
    description:
      "An app store for privacy-first tools. Install in one click, we handle the server, you keep the keys.",
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
      <body className="min-h-full flex flex-col bg-[#0c1a35]">{children}</body>
    </html>
  );
}
