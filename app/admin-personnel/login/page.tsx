"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ModeToggle } from "@/components/mode-toggle"
import { Users, ArrowLeft, Eye, EyeOff } from "lucide-react"

// --- FESTIVAL CONFIGURATION ---
interface FestivalItem {
  id: number
  left: number // Horizontal position %
  duration: number // Speed
  delay: number // Stagger start
  scale: number // Size
  color: string // Color class
  rotation: number // Initial rotation
  sway: number // Random horizontal sway
}

declare global {
  interface Window {
    turnstile: {
      render: (selector: string, options: any) => string
      getResponse: (widgetId: string) => string | undefined
      reset: (widgetId: string) => void
    }
  }
}

export default function AdminPersonnelLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [turnstileReady, setTurnstileReady] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [captchaError, setCaptchaError] = useState("")
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockoutTime, setLockoutTime] = useState(0)
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string | null>(null)

  // Festival State
  const [kites, setKites] = useState<FestivalItem[]>([])
  const [lanterns, setLanterns] = useState<FestivalItem[]>([])
  const [mounted, setMounted] = useState(false)

  const router = useRouter()
  const turnstileContainerRef = useRef<HTMLDivElement>(null)
  const turnstileWidgetRef = useRef<string | null>(null)

  // --- 1. INITIALIZE FESTIVAL ITEMS ---
  useEffect(() => {
    setMounted(true)

    // Generate Kites (Light Mode)
    // Using Pink/Fuchsia/Purple shades to match Personnel Theme
    const kiteColors = [
      "text-pink-600",
      "text-fuchsia-600",
      "text-purple-600",
      "text-rose-600",
      "text-pink-500",
      "text-purple-500",
    ]
    const newKites = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 15 + Math.random() * 20, // 15-35 seconds
      delay: Math.random() * -35,
      scale: 0.5 + Math.random() * 0.7,
      color: kiteColors[Math.floor(Math.random() * kiteColors.length)],
      rotation: Math.random() * 30 - 15,
      sway: Math.random() * 100 - 50,
    }))
    setKites(newKites)

    // Generate Lanterns (Dark Mode)
    const newLanterns = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 25 + Math.random() * 25,
      delay: Math.random() * -50,
      scale: 0.6 + Math.random() * 0.6,
      color: "text-orange-400", // Standard warm lantern
      rotation: Math.random() * 10 - 5,
      sway: Math.random() * 60 - 30,
    }))
    setLanterns(newLanterns)
  }, [])

  // --- 2. AUTH & CAPTCHA SETUP ---
  useEffect(() => {
    localStorage.removeItem("adminPersonnelAuth")
    localStorage.removeItem("adminPersonnelData")

    const handlePopState = () => {
      localStorage.removeItem("adminPersonnelAuth")
      localStorage.removeItem("adminPersonnelData")
      router.push("/")
    }

    window.addEventListener("popstate", handlePopState)

    const storedAttempts = localStorage.getItem("personnelLoginAttempts")
    const storedLockout = localStorage.getItem("personnelLoginLockout")
    if (storedAttempts) setFailedAttempts(Number.parseInt(storedAttempts))
    if (storedLockout) {
      const lockoutEnd = Number.parseInt(storedLockout)
      const now = Date.now()
      if (lockoutEnd > now) {
        setLockoutTime(lockoutEnd - now)
      }
    }

    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [router])

  useEffect(() => {
    const loadTurnstileKey = async () => {
      try {
        const response = await fetch("/api/config/turnstile-key")
        if (!response.ok) {
          throw new Error("Failed to fetch Turnstile key")
        }
        const data = await response.json()
        setTurnstileSiteKey(data.siteKey)
      } catch (err) {
        console.error("Failed to load Turnstile key:", err)
        setCaptchaError("Failed to load security verification")
      }
    }
    loadTurnstileKey()
  }, [])

  useEffect(() => {
    if (!turnstileSiteKey || !turnstileContainerRef.current) return

    const loadTurnstile = async () => {
      if (window.turnstile) {
        try {
          turnstileWidgetRef.current = window.turnstile.render("#turnstile-container-personnel", {
            sitekey: turnstileSiteKey,
            theme: "light",
            callback: (token: string) => {
              console.log("[v0] Turnstile verified successfully")
              setTurnstileToken(token)
              setCaptchaError("")
            },
            "error-callback": () => {
              console.log("[v0] Turnstile error")
              setTurnstileToken(null)
              setCaptchaError("CAPTCHA verification failed. Please try again.")
            },
            "expired-callback": () => {
              console.log("[v0] Turnstile expired")
              setTurnstileToken(null)
              setCaptchaError("CAPTCHA expired. Please verify again.")
            },
          })
          setTurnstileReady(true)
        } catch (err) {
          console.error("Turnstile render error:", err)
          setCaptchaError("Failed to initialize security verification")
        }
      }
    }

    // Load Turnstile script
    const script = document.createElement("script")
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js"
    script.async = true
    script.defer = true
    script.onload = loadTurnstile
    script.onerror = () => {
      setCaptchaError("Failed to load security verification script")
    }
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [turnstileSiteKey])

  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setTimeout(() => {
        setLockoutTime(lockoutTime - 1000)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (lockoutTime === 0 && failedAttempts >= 5) {
      setFailedAttempts(0)
      localStorage.removeItem("personnelLoginAttempts")
      localStorage.removeItem("personnelLoginLockout")
    }
  }, [lockoutTime, failedAttempts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (lockoutTime > 0) {
      setError(`Account locked. Try again in ${Math.ceil(lockoutTime / 1000)} seconds.`)
      return
    }

    const token = turnstileWidgetRef.current ? window.turnstile?.getResponse(turnstileWidgetRef.current) : null
    if (!token) {
      setError("Please complete the CAPTCHA verification")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin-personnel/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, token }),
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem("adminPersonnelAuth", data.token)
        localStorage.setItem("adminPersonnelData", JSON.stringify(data.personnel))
        localStorage.removeItem("personnelLoginAttempts")
        localStorage.removeItem("personnelLoginLockout")
        setFailedAttempts(0)
        setLockoutTime(0)
        await new Promise((resolve) => setTimeout(resolve, 500))
        router.push("/admin-personnel/dashboard")
      } else {
        const newAttempts = failedAttempts + 1
        setFailedAttempts(newAttempts)
        localStorage.setItem("personnelLoginAttempts", newAttempts.toString())

        if (newAttempts >= 5) {
          const lockoutEnd = Date.now() + 10 * 60 * 1000
          localStorage.setItem("personnelLoginLockout", lockoutEnd.toString())
          setLockoutTime(10 * 60 * 1000)
          setError("Too many failed attempts. Account locked for 10 minutes.")
        } else {
          setError(data.message || "Invalid credentials")
        }

        window.turnstile?.reset(turnstileWidgetRef.current)
        setTurnstileToken(null)
      }
    } catch {
      setError("Login failed. Please try again.")
      window.turnstile?.reset(turnstileWidgetRef.current)
      setTurnstileToken(null)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToHome = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen relative w-full overflow-hidden bg-gradient-to-br from-pink-50 via-fuchsia-50 to-purple-50 dark:from-gray-900 dark:via-fuchsia-900 dark:to-purple-900 flex items-center justify-center p-4">
      {/* --- INLINE STYLES FOR ANIMATION --- */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fullScreenFloat {
          0% { 
            transform: translateY(110vh) translateX(0) rotate(0deg); 
            opacity: 0; 
          }
          10% { 
            opacity: 1; 
          }
          90% { 
            opacity: 1; 
          }
          100% { 
            transform: translateY(-20vh) translateX(var(--sway)) rotate(10deg); 
            opacity: 0; 
          }
        }
        .festival-object {
          position: absolute;
          top: 0;
          animation-name: fullScreenFloat;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          z-index: 0;
          pointer-events: none;
          will-change: transform;
        }
      `,
        }}
      />

      {/* --- FESTIVAL LAYER --- */}
      {mounted && (
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
          {/* LIGHT MODE: KITES (PINK/FUCHSIA THEME) */}
          <div className="block dark:hidden w-full h-full">
            {kites.map((kite) => (
              <div
                key={kite.id}
                className={`festival-object ${kite.color}`}
                style={{
                  left: `${kite.left}%`,
                  // @ts-ignore
                  "--sway": `${kite.sway}px`,
                  animationDuration: `${kite.duration}s`,
                  animationDelay: `${kite.delay}s`,
                  transformOrigin: "center center",
                  width: `${60 * kite.scale}px`,
                  height: `${80 * kite.scale}px`,
                }}
              >
                <svg
                  viewBox="0 0 50 70"
                  fill="currentColor"
                  style={{ filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.15))", width: "100%", height: "100%" }}
                >
                  <path d="M25 0 L50 25 L25 50 L0 25 Z" />
                  <path d="M25 0 L25 50" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
                  <path d="M0 25 L50 25" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
                  <path d="M25 50 L32 65 L18 65 Z" fill="currentColor" opacity="0.9" />
                  <path d="M25 65 Q 25 80 15 90" stroke="rgba(0,0,0,0.2)" strokeWidth="1" fill="none" />
                </svg>
              </div>
            ))}
          </div>

          {/* DARK MODE: SKY LANTERNS */}
          <div className="hidden dark:block w-full h-full">
            {lanterns.map((lantern) => (
              <div
                key={lantern.id}
                className={`festival-object ${lantern.color}`}
                style={{
                  left: `${lantern.left}%`,
                  // @ts-ignore
                  "--sway": `${lantern.sway}px`,
                  animationDuration: `${lantern.duration}s`,
                  animationDelay: `${lantern.delay}s`,
                  width: `${50 * lantern.scale}px`,
                  height: `${60 * lantern.scale}px`,
                }}
              >
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 bg-orange-500 blur-[25px] opacity-30 rounded-full scale-125 animate-pulse"></div>
                  <svg viewBox="0 0 50 60" fill="currentColor" style={{ width: "100%", height: "100%" }}>
                    <path d="M10 10 Q 5 30 10 50 L 40 50 Q 45 30 40 10 L 10 10 Z" fillOpacity="0.9" />
                    <ellipse cx="25" cy="10" rx="15" ry="5" fillOpacity="0.5" />
                    <path d="M20 50 L 20 55 M 30 50 L 30 55" stroke="currentColor" strokeWidth="2" />
                    <circle
                      cx="25"
                      cy="30"
                      r="8"
                      fill="#FFF"
                      fillOpacity="0.8"
                      className="animate-pulse"
                      style={{ filter: "blur(4px)" }}
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToHome}
          className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Button>
        <ModeToggle />
      </div>

      <div className="w-full max-w-md relative z-20">
        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-pink-500 to-fuchsia-600 rounded-full flex items-center justify-center shadow-lg">
              <Users className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-fuchsia-600 dark:text-fuchsia-400">
                Admin Personnel
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Sign in to manage exam attendance
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-11 bg-background/50 border-2 focus:border-fuchsia-500 transition-colors"
                  required
                  disabled={loading || lockoutTime > 0}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 bg-background/50 border-2 focus:border-fuchsia-500 transition-colors pr-10"
                    required
                    disabled={loading || lockoutTime > 0}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading || lockoutTime > 0}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Verify you are human</Label>
                <div id="turnstile-container-personnel" ref={turnstileContainerRef} className="flex justify-center" />
              </div>

              {captchaError && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/20">
                  <AlertDescription className="text-sm">{captchaError}</AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/20">
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 hover:from-pink-700 hover:via-fuchsia-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading || lockoutTime > 0}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">Administrative personnel only</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="absolute bottom-4 left-4 right-4 text-center z-20">
        <p className="text-xs text-muted-foreground">
          © 2025 Avinya Project by Simon Maity All Rights Reserved. | Samanvay ERP | Developed for GUCPC, Gujarat
          University.
        </p>
      </div>
    </div>
  )
}
