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
import { GraduationCap, ArrowLeft, Eye, EyeOff, AlertTriangle } from "lucide-react"
import { StudentAuthManager } from "@/lib/student-auth"
import { ForgotPasswordDialog } from "@/components/forgot-password-dialog"

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

export default function StudentLoginPage() {
  const [enrollmentNumber, setEnrollmentNumber] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [turnstileReady, setTurnstileReady] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [captchaError, setCaptchaError] = useState("")
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockoutTime, setLockoutTime] = useState(0)
  const [siteKey, setSiteKey] = useState<string | null>(null)

  // Forgot Password State
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)

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
    // Increased count and varied speed
    const kiteColors = [
      "text-red-500",
      "text-blue-600",
      "text-orange-500",
      "text-purple-600",
      "text-pink-500",
      "text-green-600",
    ]
    const newKites = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // Random horizontal position
      duration: 15 + Math.random() * 20, // 15-35 seconds to cross screen
      delay: Math.random() * -35, // Negative delay to ensure some are already mid-screen
      scale: 0.5 + Math.random() * 0.7,
      color: kiteColors[Math.floor(Math.random() * kiteColors.length)],
      rotation: Math.random() * 30 - 15,
      sway: Math.random() * 100 - 50, // -50px to 50px sway
    }))
    setKites(newKites)

    // Generate Lanterns (Dark Mode)
    const newLanterns = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 25 + Math.random() * 25, // Slower float (25-50s)
      delay: Math.random() * -50,
      scale: 0.6 + Math.random() * 0.6,
      color: "text-orange-400",
      rotation: Math.random() * 10 - 5,
      sway: Math.random() * 60 - 30,
    }))
    setLanterns(newLanterns)
  }, [])

  // --- 2. TURNSTILE LOGIC ---
  useEffect(() => {
    fetch("/api/config/turnstile-key")
      .then((res) => res.json())
      .then((data) => {
        if (data.siteKey) {
          setSiteKey(data.siteKey)
        } else {
          setCaptchaError("Failed to load CAPTCHA configuration.")
        }
      })
      .catch(() => {
        setCaptchaError("Failed to load CAPTCHA configuration.")
      })

    const script = document.createElement("script")
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js"
    script.async = true
    script.onload = () => {}
    script.onerror = () => setCaptchaError("Failed to load CAPTCHA.")
    document.body.appendChild(script)
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script)
    }
  }, [])

  useEffect(() => {
    if (siteKey && window.turnstile && turnstileContainerRef.current && !turnstileReady) {
      renderTurnstile()
    }
  }, [siteKey, turnstileReady])

  const renderTurnstile = () => {
    if (!turnstileContainerRef.current || !window.turnstile || !siteKey) return
    try {
      const widgetId = window.turnstile.render("#turnstile-container", {
        sitekey: siteKey,
        theme: "light",
        callback: (token: string) => {
          setTurnstileToken(token)
          setCaptchaError("")
        },
        "error-callback": () => {
          setTurnstileToken(null)
          setCaptchaError("CAPTCHA verification failed.")
        },
        "expired-callback": () => {
          setTurnstileToken(null)
          setCaptchaError("CAPTCHA expired.")
        },
      })
      turnstileWidgetRef.current = widgetId
      setTurnstileReady(true)
    } catch (err) {
      console.error(err)
    }
  }

  // --- 3. LOCKOUT LOGIC ---
  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setTimeout(() => setLockoutTime(lockoutTime - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [lockoutTime])

  // --- 4. FORM HANDLER ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (lockoutTime > 0) {
      setLoading(false)
      return
    }

    if (!turnstileToken) {
      setCaptchaError("Please complete the CAPTCHA")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentNumber: enrollmentNumber.trim(),
          password,
          captchaToken: turnstileToken,
        }),
      })
      const data = await response.json()
      console.log("[v0] Login response received:", {
        success: data.success,
        hasCredentials: !!data.credentials,
        credentialsEnrollment: data.credentials?.enrollment,
        credentialsPasswordLength: data.credentials?.password?.length,
      })

      if (response.ok && data.success) {
        localStorage.removeItem("loginAttempts")
        console.log("[v0] Calling StudentAuthManager.setAuth with credentials")
        StudentAuthManager.setAuth(data.student, data.credentials.enrollment, data.credentials.password)
        router.refresh()
        setTimeout(() => router.push("/student/dashboard"), 500)
      } else {
        const newCount = failedAttempts + 1
        setFailedAttempts(newCount)
        if (newCount >= 5) setLockoutTime(10 * 60)
        setError(data.message || "Invalid credentials")
        setTurnstileToken(null)
        if (turnstileWidgetRef.current) window.turnstile.reset(turnstileWidgetRef.current)
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative w-full overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4">
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
          top: 0; /* Anchor to top */
          /* Initial transform will push it to bottom (110vh) */
          animation-name: fullScreenFloat;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          z-index: 0; /* Behind card */
          pointer-events: none;
          will-change: transform;
        }
      `,
        }}
      />

      {/* --- FESTIVAL LAYER --- */}
      {mounted && (
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
          {/* LIGHT MODE: KITES */}
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
                  // Apply scale directly to the SVG container
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
                  // Apply scale via CSS to wrapper
                  width: `${50 * lantern.scale}px`,
                  height: `${60 * lantern.scale}px`,
                }}
              >
                <div className="relative w-full h-full">
                  {/* Glow effect */}
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

      {/* --- TOP BAR --- */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            StudentAuthManager.clearAuth()
            router.push("/")
          }}
          className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Button>
        <ModeToggle />
      </div>

      {/* --- LOGIN CARD --- */}
      <div className="w-full max-w-md relative z-20">
        <Card className="shadow-2xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Student Portal
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Sign in to access your placement dashboard
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="enrollmentNumber">Enrollment Number</Label>
                <Input
                  id="enrollmentNumber"
                  placeholder="Enter your enrollment number"
                  value={enrollmentNumber}
                  onChange={(e) => setEnrollmentNumber(e.target.value)}
                  className="h-11 bg-background/50 border-2 focus:border-blue-500"
                  required
                  disabled={lockoutTime > 0 || loading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="text-xs h-auto p-0 text-blue-600 hover:text-blue-700"
                    onClick={() => setForgotPasswordOpen(true)}
                    disabled={lockoutTime > 0 || loading}
                  >
                    Forgot Password?
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 bg-background/50 border-2 focus:border-blue-500 pr-10"
                    required
                    disabled={lockoutTime > 0 || loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-11 px-3"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={lockoutTime > 0 || loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Verify you are human</Label>
                <div
                  ref={turnstileContainerRef}
                  id="turnstile-container"
                  className={`flex justify-center ${lockoutTime > 0 ? "opacity-50" : ""}`}
                />
                {captchaError && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50 text-xs">
                    <AlertDescription>{captchaError}</AlertDescription>
                  </Alert>
                )}
              </div>

              {lockoutTime > 0 && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5" />
                  <AlertDescription>
                    Too many failed attempts. Try again in {Math.floor(lockoutTime / 60)}:
                    {String(lockoutTime % 60).padStart(2, "0")}
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg"
                disabled={loading || lockoutTime > 0 || !turnstileReady}
              >
                {loading ? "Signing in..." : lockoutTime > 0 ? "Locked" : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <ForgotPasswordDialog 
        open={forgotPasswordOpen}
        onOpenChange={setForgotPasswordOpen}
        userType="student"
        identityFieldLabel="Enrollment Number"
        identityFieldPlaceholder="Enter your enrollment number"
      />

      <div className="absolute bottom-4 left-4 right-4 text-center z-20">
        <p className="text-xs text-muted-foreground">
          © 2025 Avinya Project by Simon Maity All Rights Reserved. | Samanvay ERP | Developed for GUCPC, Gujarat
          University.
        </p>
      </div>
    </div>
  )
}
