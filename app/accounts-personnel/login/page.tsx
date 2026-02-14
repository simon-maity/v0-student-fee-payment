"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DollarSign, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

declare global {
  interface Window {
    turnstile: {
      render: (selector: string, options: any) => string
      getResponse: (widgetId: string) => string | undefined
      reset: (widgetId: string) => void
    }
  }
}

export default function AccountsPersonnelLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [turnstileReady, setTurnstileReady] = useState(false)
  const [captchaError, setCaptchaError] = useState("")
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockoutTime, setLockoutTime] = useState(0)
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string | null>(null)
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const turnstileContainerRef = useRef<HTMLDivElement>(null)
  const turnstileWidgetRef = useRef<string | null>(null)

  // Initialize and manage Turnstile
  useEffect(() => {
    localStorage.removeItem("accountsPersonnelAuth")

    const storedAttempts = localStorage.getItem("accountsLoginAttempts")
    const storedLockout = localStorage.getItem("accountsLoginLockout")
    if (storedAttempts) setFailedAttempts(Number.parseInt(storedAttempts))
    if (storedLockout) {
      const lockoutEnd = Number.parseInt(storedLockout)
      const now = Date.now()
      if (lockoutEnd > now) {
        setLockoutTime(lockoutEnd - now)
      }
    }
  }, [])

  // Load Turnstile site key
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

  // Initialize Turnstile widget
  useEffect(() => {
    if (!turnstileSiteKey || !turnstileContainerRef.current) return

    const loadTurnstile = async () => {
      if (window.turnstile) {
        try {
          turnstileWidgetRef.current = window.turnstile.render("#turnstile-container-accounts", {
            sitekey: turnstileSiteKey,
            theme: "light",
            callback: (token: string) => {
              console.log("[v0] Turnstile verified successfully, token length:", token.length)
              setIsCaptchaVerified(true)
              setCaptchaError("")
            },
            "error-callback": () => {
              console.log("[v0] Turnstile error callback triggered")
              setIsCaptchaVerified(false)
              setCaptchaError("CAPTCHA verification failed. Please try again.")
            },
            "expired-callback": () => {
              console.log("[v0] Turnstile expired callback triggered")
              setIsCaptchaVerified(false)
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

  // Manage lockout timer
  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setTimeout(() => {
        setLockoutTime(lockoutTime - 1000)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (lockoutTime === 0 && failedAttempts >= 5) {
      setFailedAttempts(0)
      localStorage.removeItem("accountsLoginAttempts")
      localStorage.removeItem("accountsLoginLockout")
    }
  }, [lockoutTime, failedAttempts])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (lockoutTime > 0) {
      setError(`Account locked. Try again in ${Math.ceil(lockoutTime / 1000)} seconds.`)
      return
    }

    // Get token directly from Turnstile widget at submission time
    let token: string | undefined
    if (turnstileWidgetRef.current && window.turnstile) {
      token = window.turnstile.getResponse(turnstileWidgetRef.current)
    }

    console.log("[v0] Token retrieval at login:", { hasToken: !!token, widgetRef: !!turnstileWidgetRef.current })

    if (!token) {
      setError("Please complete the CAPTCHA verification")
      return
    }

    if (!username || !password) {
      setError("Please enter username and password")
      return
    }

    setLoading(true)
    setError("")

    try {
      console.log("[v0] Attempting accounts personnel login with credentials:", { username, tokenLength: token.length })
      const response = await fetch("/api/accounts-personnel/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, token }),
      })

      const data = await response.json()
      console.log("[v0] Login response:", { 
        status: response.status, 
        ok: response.ok,
        success: data.success, 
        message: data.message,
        error: data.error,
        hasToken: !!data.token 
      })

      if (response.ok && data.success) {
        localStorage.setItem("accountsPersonnelToken", data.token)
        localStorage.setItem("accountsPersonnelAuth", JSON.stringify(data.personnel || {}))
        localStorage.removeItem("accountsLoginAttempts")
        localStorage.removeItem("accountsLoginLockout")
        setFailedAttempts(0)
        setLockoutTime(0)
        console.log("[v0] Accounts personnel login successful, token saved")

        toast({
          title: "Login Successful",
          description: "Welcome to Accounts Personnel Portal",
        })

        setUsername("")
        setPassword("")

        await new Promise((resolve) => setTimeout(resolve, 500))
        router.push("/accounts-personnel/dashboard")
      } else {
        console.log("[v0] Login failed with response:", data)
        
        // Only increment failed attempts for non-CAPTCHA errors
        if (!data.message?.includes("CAPTCHA")) {
          const newAttempts = failedAttempts + 1
          setFailedAttempts(newAttempts)
          localStorage.setItem("accountsLoginAttempts", newAttempts.toString())

          if (newAttempts >= 5) {
            const lockoutEnd = Date.now() + 10 * 60 * 1000
            localStorage.setItem("accountsLoginLockout", lockoutEnd.toString())
            setLockoutTime(10 * 60 * 1000)
          }
        }

        setError(data.message || data.error || "Login failed")

        if (turnstileWidgetRef.current) {
          window.turnstile?.reset(turnstileWidgetRef.current)
        }
        setIsCaptchaVerified(false)
      }
    } catch (error) {
      console.error("[v0] Login error:", error)
      setError("Something went wrong. Please try again.")

      if (turnstileWidgetRef.current) {
        window.turnstile?.reset(turnstileWidgetRef.current)
      }
      setIsCaptchaVerified(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Accounts Personnel</CardTitle>
          <CardDescription>Sign in to manage fees and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {lockoutTime > 0 && (
              <Alert variant="destructive">
                <AlertDescription>Account locked. Try again in {Math.ceil(lockoutTime / 1000)} seconds.</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading || lockoutTime > 0}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || lockoutTime > 0}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading || lockoutTime > 0}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {captchaError && (
              <Alert variant="destructive">
                <AlertDescription>{captchaError}</AlertDescription>
              </Alert>
            )}

            <div ref={turnstileContainerRef} id="turnstile-container-accounts" className="flex justify-center" />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || lockoutTime > 0 || !isCaptchaVerified}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
