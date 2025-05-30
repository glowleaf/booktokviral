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
          className="text-pink-600 hover:text-pink-700 text-sm flex items-center"
        >
          🎵 View on TikTok
        </a>
      )
    }
    
    return (
      <div className={`p-4 bg-pink-50 rounded-lg ${className}`}>
        <h4 className="font-semibold text-pink-900 mb-2">🎵 BookTok Video</h4>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-600 hover:text-pink-700 underline"
        >
          Watch on TikTok →
        </a>
      </div>
    )
  }

  if (!isLoaded) {
    if (compact) {
      return (
        <button
          onClick={loadEmbed}
          disabled={isLoading}
          className="text-pink-600 hover:text-pink-700 text-sm flex items-center space-x-1"
        >
          {isLoading ? (
            <>
              <span className="animate-spin text-xs">⏳</span>
              <span>Loading...</span>
            </>
          ) : (
            <>
              <span>▶️</span>
              <span>Play TikTok</span>
            </>
          )}
        </button>
      )
    }
    
    return (
      <div className={`p-4 bg-pink-50 rounded-lg ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-pink-900 mb-1">🎵 BookTok Video</h4>
            <p className="text-sm text-pink-700">Click to watch the TikTok video</p>
          </div>
          <button
            onClick={loadEmbed}
            disabled={isLoading}
            className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>▶️</span>
                <span>Play Video</span>
              </>
            )}
          </button>
        </div>
        <div className="mt-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-pink-600 hover:text-pink-700 underline"
          >
            Or open in TikTok app →
          </a>
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-center">
          <blockquote
            className="tiktok-embed"
            cite={url}
            data-video-id={videoId}
            style={{ maxWidth: '250px', minWidth: '250px' }}
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
    )
  }

  return (
    <div className={`p-4 bg-pink-50 rounded-lg ${className}`}>
      <h4 className="font-semibold text-pink-900 mb-3">🎵 BookTok Video</h4>
      <div className="flex justify-center">
        <blockquote
          className="tiktok-embed"
          cite={url}
          data-video-id={videoId}
          style={{ maxWidth: '325px', minWidth: '325px' }}
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
      <div className="mt-2 text-center">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-pink-600 hover:text-pink-700 underline"
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