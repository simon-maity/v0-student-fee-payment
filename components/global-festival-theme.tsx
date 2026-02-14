"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

interface FestivalItem {
  id: number
  left: number
  top: number
  scale: number
  color: string
  animationDuration: number
  delay: number
}

export function GlobalFestivalTheme() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [kites, setKites] = useState<FestivalItem[]>([])
  const [lanterns, setLanterns] = useState<FestivalItem[]>([])

  useEffect(() => {
    setMounted(true)

    // --- LIGHT MODE: KITES (Overlay Mode) ---
    const kiteColors = [
      "text-red-500/40", 
      "text-blue-500/40", 
      "text-orange-500/40", 
      "text-green-500/40", 
      "text-purple-500/40",
      "text-pink-500/40"
    ]
    
    setKites(Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      scale: 0.4 + Math.random() * 0.4, // Slightly larger for visibility
      color: kiteColors[Math.floor(Math.random() * kiteColors.length)],
      animationDuration: 6 + Math.random() * 8, // Faster bobbing (6-14s)
      delay: Math.random() * -20,
    })))

    // --- DARK MODE: LANTERNS (Overlay Mode) ---
    setLanterns(Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 120,
      scale: 0.3 + Math.random() * 0.4,
      color: "text-orange-500/30",
      animationDuration: 30 + Math.random() * 20,
      delay: Math.random() * -50,
    })))
  }, [])

  if (pathname === "/" || pathname?.endsWith("/login")) {
    return null
  }

  if (!mounted) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50 select-none">
      <style>{`
        @keyframes kiteFloat {
          0%, 100% { transform: translateY(0px) rotate(-5deg); }
          50% { transform: translateY(-25px) rotate(10deg); } /* Increased movement */
        }
        @keyframes lanternFloat {
          0% { transform: translateY(10vh); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateY(-100vh); opacity: 0; }
        }
      `}</style>

      {/* LIGHT MODE KITES */}
      <div className="block dark:hidden w-full h-full">
        {kites.map((kite) => (
          <div
            key={kite.id}
            className={`absolute ${kite.color}`}
            style={{
              left: `${kite.left}%`,
              top: `${kite.top}%`,
              // 1. ANIMATION APPLIED TO PARENT
              animation: `kiteFloat ${kite.animationDuration}s ease-in-out infinite`,
              animationDelay: `${kite.delay}s`,
            }}
          >
            {/* 2. SCALE APPLIED TO CHILD (Prevents Conflict) */}
            <div style={{ transform: `scale(${kite.scale})` }}>
              <svg width="60" height="80" viewBox="0 0 50 70" fill="currentColor">
                <path d="M25 0 L50 25 L25 50 L0 25 Z" />
                <path d="M25 50 L30 60 L20 60 Z" opacity="0.6" />
                <path d="M25 0 L25 50" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.5" />
                {/* String */}
                <path d="M25 50 Q 25 65 15 70" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.3" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* DARK MODE LANTERNS */}
      <div className="hidden dark:block w-full h-full">
        {lanterns.map((lantern) => (
          <div
            key={lantern.id}
            className={`absolute ${lantern.color}`}
            style={{
              left: `${lantern.left}%`,
              bottom: "-50px",
              // Animation on Parent
              animation: `lanternFloat ${lantern.animationDuration}s linear infinite`,
              animationDelay: `${lantern.delay}s`,
            }}
          >
            {/* Scale on Child */}
            <div style={{ transform: `scale(${lantern.scale})` }}>
              <div className="relative">
                <div className="absolute inset-0 bg-orange-600 blur-xl opacity-30 rounded-full"></div>
                <svg width="40" height="50" viewBox="0 0 40 50" fill="currentColor">
                   <path d="M10 10 Q 5 25 10 40 L 30 40 Q 35 25 30 10 L 10 10 Z" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
