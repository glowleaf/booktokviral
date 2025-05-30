import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Navigation from "@/components/Navigation";
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
        <footer className="bg-gray-50 border-t mt-16">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500">
              © 2024 BookTok Viral. Discover your next favorite book.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
