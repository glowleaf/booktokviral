'use client'

import { useState } from 'react'

interface TikTokEmbedProps {
  url: string
  className?: string
  compact?: boolean
}

export default function TikTokEmbed({ url, className = '', compact = false }: TikTokEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Extract TikTok video ID from URL
  const getTikTokVideoId = (url: string): string | null => {
    try {
      const patterns = [
        /tiktok\.com\/@[^/]+\/video\/(\d+)/,
        /tiktok\.com\/t\/([A-Za-z0-9]+)/,
        /vm\.tiktok\.com\/([A-Za-z0-9]+)/
      ]
      
      for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) return match[1]
      }
      return null
    } catch {
      return null
    }
  }

  const loadEmbed = async () => {
    setIsLoading(true)
    
    // Load TikTok embed script if not already loaded
    if (!window.TikTokEmbed) {
      const script = document.createElement('script')
      script.src = 'https://www.tiktok.com/embed.js'
      script.async = true
      document.head.appendChild(script)
      
      // Wait for script to load
      await new Promise((resolve) => {
        script.onload = resolve
      })
    }
    
    setIsLoaded(true)
    setIsLoading(false)
    
    // Process embeds after a short delay
    setTimeout(() => {
      if (window.TikTokEmbed) {
        window.TikTokEmbed.lib.render()
      }
    }, 100)
  }

  const videoId = getTikTokVideoId(url)

  if (!videoId) {
    // Fallback to simple link if we can't parse the URL
    if (compact) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center bg-gradient-to-r from-black via-gray-800 to-black text-white px-4 py-2 rounded-xl font-bold text-sm hover:scale-105 transform transition-all duration-300 shadow-lg border-2 border-pink-400"
        >
          🎵 WATCH ON TIKTOK! 🔥
        </a>
      )
    }
    
    return (
      <div className={`p-6 bg-gradient-to-r from-black via-gray-800 to-black rounded-2xl border-4 border-pink-400 shadow-2xl ${className}`}>
        <h4 className="text-2xl font-black text-white mb-4 text-center">🎵 VIRAL BOOKTOK VIDEO! 🎵</h4>
        <div className="text-center">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-black text-lg hover:scale-110 transform transition-all duration-300 shadow-xl border-4 border-white"
          >
            🚀 WATCH VIRAL VIDEO NOW! 🚀
          </a>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    if (compact) {
      return (
        <div className="mt-4 pt-4 border-t border-pink-200">
          <div className="text-center">
            <button
              onClick={loadEmbed}
              disabled={isLoading}
              className="bg-gradient-to-r from-black via-gray-800 to-black text-white px-6 py-3 rounded-2xl font-black text-lg hover:scale-110 transform transition-all duration-300 shadow-2xl border-4 border-pink-400 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2 text-xl">⏳</span>
                  <span>LOADING VIRAL VIDEO...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <span className="mr-2 text-2xl animate-pulse">▶️</span>
                  <span>🔥 PLAY VIRAL TIKTOK! 🔥</span>
                </span>
              )}
            </button>
          </div>
        </div>
      )
    }
    
    return (
      <div className={`p-6 bg-gradient-to-r from-black via-gray-800 to-black rounded-2xl border-4 border-pink-400 shadow-2xl ${className}`}>
        <div className="text-center">
          <h4 className="text-3xl font-black text-white mb-2">🎵 VIRAL BOOKTOK VIDEO! 🎵</h4>
          <p className="text-lg text-gray-300 font-bold mb-6">🚨 CLICK TO WATCH THE VIRAL CONTENT! 🚨</p>
          <button
            onClick={loadEmbed}
            disabled={isLoading}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-10 py-5 rounded-2xl font-black text-xl hover:scale-110 transform transition-all duration-300 shadow-2xl border-4 border-white disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-3 text-2xl">⏳</span>
                <span>LOADING VIRAL VIDEO...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <span className="mr-3 text-3xl animate-pulse">▶️</span>
                <span>🚀 PLAY VIRAL VIDEO NOW! 🚀</span>
              </span>
            )}
          </button>
          <div className="mt-4">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-400 hover:text-pink-300 underline font-semibold"
            >
              Or open in TikTok app →
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="mt-4 pt-4 border-t border-pink-200">
        <div className="bg-gradient-to-r from-black via-gray-800 to-black rounded-2xl p-4 border-4 border-pink-400 shadow-2xl">
          <h5 className="text-white font-black text-center mb-3">🎵 VIRAL BOOKTOK! 🎵</h5>
          <div className="flex justify-center">
            <div className="w-full max-w-[280px] mx-auto">
              <div className="relative w-full" style={{ aspectRatio: '9/16' }}>
                <blockquote
                  className="tiktok-embed w-full h-full"
                  cite={url}
                  data-video-id={videoId}
                  style={{ 
                    maxWidth: '100%', 
                    minWidth: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}
                >
                  <section>
                    <a
                      target="_blank"
                      title="@username"
                      href={url}
                      rel="noopener noreferrer"
                    >
                      View on TikTok
                    </a>
                  </section>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-6 bg-gradient-to-r from-black via-gray-800 to-black rounded-2xl border-4 border-pink-400 shadow-2xl ${className}`}>
      <h4 className="text-3xl font-black text-white mb-4 text-center">🎵 VIRAL BOOKTOK VIDEO! 🎵</h4>
      <div className="flex justify-center">
        <div className="w-full max-w-[350px] mx-auto">
          <div className="relative w-full" style={{ aspectRatio: '9/16' }}>
            <blockquote
              className="tiktok-embed w-full h-full"
              cite={url}
              data-video-id={videoId}
              style={{ 
                maxWidth: '100%', 
                minWidth: '100%',
                height: '100%',
                border: 'none',
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            >
              <section>
                <a
                  target="_blank"
                  title="@username"
                  href={url}
                  rel="noopener noreferrer"
                >
                  View on TikTok
                </a>
              </section>
            </blockquote>
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-400 hover:text-pink-300 underline font-semibold"
        >
          Open in TikTok app →
        </a>
      </div>
    </div>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    TikTokEmbed?: {
      lib: {
        render: () => void
      }
    }
  }
} 