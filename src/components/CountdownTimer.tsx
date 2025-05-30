'use client'

import { useState, useEffect } from 'react'

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const nextMonday = new Date()
      
      // Get next Monday at midnight
      const daysUntilMonday = (8 - now.getDay()) % 7 || 7
      nextMonday.setDate(now.getDate() + daysUntilMonday)
      nextMonday.setHours(0, 0, 0, 0)
      
      const difference = nextMonday.getTime() - now.getTime()
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="text-center mb-8">
      <p className="text-lg font-bold text-gray-700 mb-4">
        ⏰ Time until next launch week ⏰
      </p>
      <div className="flex justify-center space-x-4 text-center">
        <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-pink-200">
          <div className="text-3xl font-black text-pink-600">
            {String(timeLeft.days).padStart(2, '0')}
          </div>
          <div className="text-sm font-semibold text-gray-600">days</div>
        </div>
        <div className="flex items-center text-2xl font-black text-pink-600">:</div>
        <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-purple-200">
          <div className="text-3xl font-black text-purple-600">
            {String(timeLeft.hours).padStart(2, '0')}
          </div>
          <div className="text-sm font-semibold text-gray-600">hours</div>
        </div>
        <div className="flex items-center text-2xl font-black text-purple-600">:</div>
        <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-yellow-200">
          <div className="text-3xl font-black text-yellow-600">
            {String(timeLeft.minutes).padStart(2, '0')}
          </div>
          <div className="text-sm font-semibold text-gray-600">mins</div>
        </div>
        <div className="flex items-center text-2xl font-black text-yellow-600">:</div>
        <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-orange-200">
          <div className="text-3xl font-black text-orange-600">
            {String(timeLeft.seconds).padStart(2, '0')}
          </div>
          <div className="text-sm font-semibold text-gray-600">secs</div>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-4 font-semibold">
        🚨 Votes reset every Monday at midnight! 🚨
      </p>
    </div>
  )
} 