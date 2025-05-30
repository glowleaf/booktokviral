'use client'

import { useState } from 'react'
import Link from 'next/link'

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleOpen = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="border-b border-pink-200 last:border-b-0 py-6">
      <div 
        className="flex justify-between items-center cursor-pointer group hover:bg-pink-50 p-4 rounded-xl transition-all duration-300" 
        onClick={toggleOpen}
      >
        <h3 className="font-black text-xl text-gray-900 group-hover:text-pink-600 transition-colors">
          {question}
        </h3>
        <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <svg
            className="w-8 h-8 text-pink-600 group-hover:text-purple-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={3} 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
        </div>
      </div>
      {isOpen && (
        <div className="mt-4 px-4 pb-2">
          <p className="text-gray-700 text-lg leading-relaxed font-medium">
            {answer}
          </p>
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  const faqData = [
    {
      question: "🚀 What is BookTok Viral?",
      answer: "BookTok Viral is the BookBub of BookTok! Just like BookBub helps readers discover amazing books and deals, we help the TikTok generation find their next viral read. Submit books, vote for favorites, and watch them climb our weekly leaderboard to BookTok fame!"
    },
    {
      question: "📚 How do I submit a book?",
      answer: "Super easy! Just click 'Submit Book', enter the Amazon ASIN (we auto-detect it from Amazon URLs), add your TikTok video link, and boom - your book is live! You need to sign in first to submit books and track your submissions."
    },
    {
      question: "🗳️ How does the voting system work?",
      answer: "Anyone can vote for books they love - no account required! We use secure cookie tracking so you can only vote once per book. Authenticated users can also vote normally. Votes determine the weekly rankings, and the top 3 books each week get special badges (🥇🥈🥉) and massive exposure. Votes reset every Monday at midnight!"
    },
    {
      question: "⭐ What does 'Get Featured' mean?",
      answer: "Featured books get premium placement at the top of the homepage with special styling and maximum visibility! It costs $9.99/week and gives your book the best chance to go viral. Only book owners can feature their own submissions."
    },
    {
      question: "💰 How much does it cost to use BookTok Viral?",
      answer: "Submitting books and voting is completely FREE! The only paid feature is 'Get Featured' for $9.99/week, which gives your book premium placement and maximum viral potential. Think of it as BookTok advertising!"
    },
    {
      question: "📱 Do I need a TikTok account?",
      answer: "You don't need TikTok to use our platform, but having TikTok videos of your book recommendations makes them way more likely to go viral! TikTok links are optional but highly recommended for maximum engagement."
    },
    {
      question: "🔄 When do votes reset?",
      answer: "Votes reset every Monday at midnight! This creates weekly competitions where books compete for the top spots. You can see the countdown timer on the homepage showing exactly when the next reset happens."
    },
    {
      question: "🏆 What happens to weekly winners?",
      answer: "The top 3 books each week get special winner badges (🥇🥈🥉) and are featured in our 'Past Viral' hall of fame! They get permanent recognition and are showcased as BookTok legends who dominated their week."
    },
    {
      question: "📖 What's an ASIN and how do I find it?",
      answer: "ASIN is Amazon's unique book identifier (like B0F88CP8MF). Just paste any Amazon book URL and we'll automatically extract the ASIN for you! You can also find it in the product details section on Amazon."
    },
    {
      question: "🎵 Can I follow you on TikTok?",
      answer: "YES! Follow @booktokviralcom for the hottest book trends, featured submissions, and viral BookTok content! We showcase the best books from our platform and help them reach even more BookTok audiences."
    },
    {
      question: "🔐 Is my account information safe?",
      answer: "Absolutely! We use Supabase for secure authentication and only store your email and TikTok handle (optional). We never share your information and you can delete your account anytime."
    },
    {
      question: "📊 How can I track my book's performance?",
      answer: "Once you submit a book, you can see its vote count, ranking position, and whether it's featured. Check the weekly leaderboard to see how your book is performing against others!"
    },
    {
      question: "🚨 Can I submit the same book multiple times?",
      answer: "Nope! Each book (ASIN) can only be submitted once to keep things fair. But you can submit as many different books as you want! Quality over quantity is the key to viral success."
    },
    {
      question: "📚 I'm not the author but I just love this book, can I submit it?",
      answer: "YES! BookTok Viral is for ALL book lovers, not just authors! If you've read an amazing book and want to help it go viral, absolutely submit it. Share your TikTok review, get people voting, and help spread the BookTok love! The best book recommendations often come from passionate readers."
    },
    {
      question: "💡 What makes a book go viral on BookTok?",
      answer: "Great TikTok videos, engaging book covers, compelling stories, and community voting! Books with TikTok links perform way better. The more people vote for your book, the higher it ranks!"
    },
    {
      question: "🎯 Who can vote for books?",
      answer: "EVERYONE! You don't need an account to vote - just click the heart button and we'll remember your vote with secure cookies. Signed-in users can vote too. This makes it super easy for anyone to participate and help books go viral!"
    },
    {
      question: "📅 How long do featured books stay featured?",
      answer: "Featured books stay at the top for exactly one week (7 days) from when you purchase the feature. You can see the countdown and re-feature your book anytime if you want to extend the exposure!"
    },
    {
      question: "🔥 What if my book doesn't get votes?",
      answer: "Don't give up! Share your book submission on your social media, ask friends to vote, and make sure you have an engaging TikTok video. Sometimes it takes time to build momentum - keep promoting!"
    },
    {
      question: "🤔 How is this different from BookBub?",
      answer: "BookBub focuses on email newsletters and deals for traditional readers. We're the BookBub for the TikTok generation! We focus on viral discovery, social voting, weekly competitions, and helping books explode on TikTok through community engagement."
    },
    {
      question: "📧 How do I contact support?",
      answer: "For any questions, issues, or suggestions, you can reach out through our TikTok @booktokviralcom or check back here for updates. We're always working to make BookTok Viral even better!"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-yellow-500 mb-6 animate-pulse">
            ❓ FREQUENTLY ASKED QUESTIONS ❓
          </h1>
          <p className="text-2xl text-gray-700 font-bold mb-6">
            🔥 THE BOOKBUB OF BOOKTOK - EVERYTHING YOU NEED TO KNOW! 🔥
          </p>
          <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-yellow-100 border-4 border-pink-400 rounded-2xl p-6 max-w-3xl mx-auto shadow-2xl">
            <p className="text-pink-800 text-lg font-black">
              💡 DISCOVER YOUR NEXT VIRAL READ! 💡
              <br />
              🚨 Click any question below to reveal the answer! 🚨
            </p>
          </div>
        </div>

        {/* FAQ Items */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-pink-200">
          <div className="space-y-2">
            {faqData.map((item, index) => (
              <FAQItem 
                key={index} 
                question={item.question} 
                answer={item.answer} 
              />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-3xl p-2 shadow-2xl">
            <div className="bg-white rounded-2xl p-8 text-center">
              <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-pink-600 to-purple-700 mb-4">
                🚀 READY TO GO VIRAL? 🚀
              </h3>
              <p className="text-xl font-bold text-gray-700 mb-6">
                Join thousands of BookTokers and start your viral journey today!
              </p>
              <div className="flex justify-center space-x-4 flex-wrap gap-4">
                <Link
                  href="/submit"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-2xl text-xl font-black hover:scale-110 transform transition-all duration-300 shadow-2xl border-4 border-white"
                >
                  📚 Submit Your Book
                </Link>
                <Link
                  href="/"
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-2xl text-xl font-black hover:scale-110 transform transition-all duration-300 shadow-2xl border-4 border-white"
                >
                  🏆 See Rankings
                </Link>
                <a
                  href="https://www.tiktok.com/@booktokviralcom"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-2xl text-xl font-black hover:scale-110 transform transition-all duration-300 shadow-2xl border-4 border-white"
                >
                  🎵 Follow on TikTok
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-pink-600 hover:text-pink-700 underline font-bold text-lg"
          >
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
} 