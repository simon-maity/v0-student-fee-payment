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
import { Wrench, ArrowLeft, Eye, EyeOff } from "lucide-react"

declare global {
  interface Window {
    turnstile: {
      render: (selector: string, options: any) => string
      getResponse: (widgetId: string) => string | undefined
      reset: (widgetId: string) => void
    }
  }
}

export default function PeonLoginPage() {
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
  const [siteKey, setSiteKey] = useState<string | null>(null)

  const router = useRouter()
  const turnstileContainerRef = useRef<HTMLDivElement>(null)
  const turnstileWidgetRef = useRef<string | null>(null)

  useEffect(() => {
    localStorage.removeItem("peonAuth")
    localStorage.removeItem("peonData")

    const handlePopState = () => {
      localStorage.removeItem("peonAuth")
      localStorage.removeItem("peonData")
      router.push("/")
    }

    window.addEventListener("popstate", handlePopState)

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
    script.onload = () => {
      console.log("[v0] Turnstile script loaded")
    }
    script.onerror = () => {
      console.error("[v0] Failed to load Turnstile script")
      setCaptchaError("Failed to load CAPTCHA. Please refresh the page.")
    }
    document.body.appendChild(script)

    const storedAttempts = localStorage.getItem("peonLoginAttempts")
    const storedLockout = localStorage.getItem("peonLoginLockout")
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
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [router])

  useEffect(() => {
    if (siteKey && window.turnstile && turnstileContainerRef.current && !turnstileReady) {
      renderTurnstile()
    }
  }, [siteKey, turnstileReady])

  const renderTurnstile = () => {
    if (!turnstileContainerRef.current || !window.turnstile || !siteKey) {
      console.log("[v0] Turnstile not ready or container missing")
      return
    }

    try {
      const widgetId = window.turnstile.render("#turnstile-container-peon", {
        sitekey: siteKey,
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
      turnstileWidgetRef.current = widgetId
      setTurnstileReady(true)
    } catch (err) {
      console.error("[v0] Error rendering Turnstile:", err)
      setCaptchaError("Failed to initialize CAPTCHA")
    }
  }

  const resetTurnstile = () => {
    if (turnstileWidgetRef.current !== null && window.turnstile) {
      try {
        window.turnstile.reset(turnstileWidgetRef.current)
      } catch (err) {
        console.error("[v0] Error resetting Turnstile:", err)
      }
    }
  }

  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setTimeout(() => {
        setLockoutTime(lockoutTime - 1000)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (lockoutTime === 0 && failedAttempts >= 5) {
      setFailedAttempts(0)
      localStorage.removeItem("peonLoginAttempts")
      localStorage.removeItem("peonLoginLockout")
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
      const response = await fetch("/api/peon/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, token }),
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem("peonAuth", data.token)
        localStorage.setItem("peonData", JSON.stringify(data.user))
        localStorage.removeItem("peonLoginAttempts")
        localStorage.removeItem("peonLoginLockout")
        setFailedAttempts(0)
        setLockoutTime(0)
        await new Promise((resolve) => setTimeout(resolve, 500))
        router.push("/peon/dashboard")
      } else {
        const newAttempts = failedAttempts + 1
        setFailedAttempts(newAttempts)
        localStorage.setItem("peonLoginAttempts", newAttempts.toString())

        if (newAttempts >= 5) {
          const lockoutEnd = Date.now() + 10 * 60 * 1000
          localStorage.setItem("peonLoginLockout", lockoutEnd.toString())
          setLockoutTime(10 * 60 * 1000)
          setError("Too many failed attempts. Account locked for 10 minutes.")
        } else {
          setError(data.message || "Invalid credentials")
        }

        resetTurnstile()
        setTurnstileToken(null)
      }
    } catch {
      setError("Login failed. Please try again.")
      resetTurnstile()
      setTurnstileToken(null)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToHome = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-gray-900 dark:via-yellow-900 dark:to-orange-900 flex items-center justify-center p-4 relative">
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
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

      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
              <Wrench className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                Peon & Housekeeping
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Sign in to access your portal
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
                  className="h-11 bg-background/50 border-2 focus:border-yellow-500 transition-colors"
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
                    className="h-11 bg-background/50 border-2 focus:border-yellow-500 transition-colors pr-10"
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
                <div id="turnstile-container-peon" ref={turnstileContainerRef} className="flex justify-center" />
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
                className="w-full h-11 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
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
              <p className="text-sm text-muted-foreground">Peon & Housekeeping Staff Only</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="absolute bottom-4 left-4 right-4 text-center">
        <p className="text-sm text-foreground">
          © 2025 Avinya Project by Simon Maity All Rights Reserved. | Samanvay ERP | Developed for GUCPC, Gujarat
          University.
        </p>
      </div>
    </div>
  )
}
