import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
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
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold text-pink-600">
                  📚 BookTok Viral
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/weekly" className="text-gray-700 hover:text-pink-600">
                  Weekly Leaderboard
                </Link>
                <Link href="/submit" className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700">
                  Submit Book
                </Link>
              </div>
            </div>
          </div>
        </nav>
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
