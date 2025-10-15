import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ValidCoop - Modern Cooperative Management Platform",
  description:
    "Empower your cooperative with modern technology solutions. Streamline operations, enhance member engagement, and drive growth with our comprehensive platform.",
  keywords:
    "cooperative, management, platform, members, loans, assets, payments, analytics",
  authors: [{ name: "ValidCoop Team" }],
  openGraph: {
    title: "ValidCoop - Modern Cooperative Management Platform",
    description:
      "Empower your cooperative with modern technology solutions. Streamline operations, enhance member engagement, and drive growth.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ValidCoop - Modern Cooperative Management Platform",
    description: "Empower your cooperative with modern technology solutions.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
