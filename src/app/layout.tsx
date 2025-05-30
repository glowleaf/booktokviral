import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BookTok Viral - Discover Your Next Favorite Book",
  description: "Submit and vote for the most viral books on BookTok. Discover trending reads and feature your favorite books.",
  keywords: "BookTok, books, reading, viral, TikTok, literature, book recommendations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
