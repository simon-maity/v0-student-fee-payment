"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DollarSign, Eye, EyeOff, Sun, Moon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"

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
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const turnstileContainerRef = useRef<HTMLDivElement>(null)
  const turnstileWidgetRef = useRef<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

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
            theme: theme === "dark" ? "dark" : "light",
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
      if (turnstileWidgetRef.current) {
        // Clean up Turnstile widget
        const container = document.getElementById("turnstile-container-accounts")
        if (container) {
          container.innerHTML = ""
        }
        turnstileWidgetRef.current = null
      }
    }
  }, [turnstileSiteKey, theme])

  // Reset Turnstile when theme changes
  useEffect(() => {
    if (turnstileWidgetRef.current && window.turnstile) {
      window.turnstile.reset(turnstileWidgetRef.current)
    }
  }, [theme])

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

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (!mounted) {
    return null
  }

  const isDarkMode = theme === "dark"

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        background: isDarkMode
          ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
          : 'linear-gradient(135deg, #fff5f7 0%, #ffe4e6 100%)'
      }}
    >
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-full transition-all duration-200 z-10"
        style={{
          background: isDarkMode ? '#374151' : '#f3f4f6',
          color: isDarkMode ? '#fbb6ce' : '#e11d48',
          border: isDarkMode ? '1px solid #4b5563' : '1px solid #e5e7eb'
        }}
        aria-label="Toggle theme"
      >
        {isDarkMode ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </button>

      <Card className="w-full max-w-md" style={{
        border: isDarkMode ? '2px solid #7f1d1d' : '2px solid #fecdd3',
        boxShadow: isDarkMode
          ? '0 10px 25px rgba(127, 29, 29, 0.3)'
          : '0 10px 25px rgba(244, 63, 94, 0.1)',
        backgroundColor: isDarkMode ? '#1f2937' : 'white'
      }}>
        <CardHeader className="space-y-1 text-center relative">
          {/* Background pattern for better text visibility */}
          <div className="absolute inset-0 rounded-t-lg opacity-5" style={{
            background: isDarkMode
              ? 'linear-gradient(45deg, #fbb6ce 25%, transparent 25%, transparent 50%, #fbb6ce 50%, #fbb6ce 75%, transparent 75%, transparent)'
              : 'linear-gradient(45deg, #e11d48 25%, transparent 25%, transparent 50%, #e11d48 50%, #e11d48 75%, transparent 75%, transparent)',
            backgroundSize: '20px 20px'
          }} />

          <div className="flex justify-center mb-4 relative z-10">
            <div className="p-3 rounded-full" style={{
              background: isDarkMode
                ? 'linear-gradient(135deg, #7f1d1d 0%, #9f1239 100%)'
                : 'linear-gradient(135deg, #fecdd3 0%, #fda4af 100%)',
              boxShadow: isDarkMode
                ? '0 4px 6px rgba(127, 29, 29, 0.4)'
                : '0 4px 6px rgba(244, 63, 94, 0.2)'
            }}>
              <DollarSign className="h-8 w-8" style={{
                color: isDarkMode ? '#fbb6ce' : '#e11d48'
              }} />
            </div>
          </div>

          <CardTitle className="text-2xl font-bold relative z-10" style={{
            color: isDarkMode ? '#fbb6ce' : '#e11d48',
            textShadow: isDarkMode
              ? '0 2px 4px rgba(0, 0, 0, 0.5)'
              : '0 2px 4px rgba(225, 29, 72, 0.2)'
          }}>
            Accounts Personnel
          </CardTitle>

          <CardDescription className="relative z-10" style={{
            color: isDarkMode ? '#d1d5db' : '#6b7280',
            textShadow: isDarkMode ? '0 1px 2px rgba(0, 0, 0, 0.3)' : 'none'
          }}>
            Sign in to manage fees and financial operations
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive" style={{
                borderColor: isDarkMode ? '#9f1239' : '#fda4af',
                backgroundColor: isDarkMode ? '#2d1b1b' : '#fff1f2'
              }}>
                <AlertDescription style={{
                  color: isDarkMode ? '#fecaca' : '#be123c'
                }}>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {lockoutTime > 0 && (
              <Alert variant="destructive" style={{
                borderColor: isDarkMode ? '#9f1239' : '#fda4af',
                backgroundColor: isDarkMode ? '#2d1b1b' : '#fff1f2'
              }}>
                <AlertDescription style={{
                  color: isDarkMode ? '#fecaca' : '#be123c'
                }}>
                  Account locked. Try again in {Math.ceil(lockoutTime / 1000)} seconds.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" style={{
                color: isDarkMode ? '#e5e7eb' : '#374151'
              }}>
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading || lockoutTime > 0}
                required
                className={isDarkMode ? "dark" : ""}
                style={{
                  borderColor: isDarkMode ? '#4b5563' : '#fecaca',
                  backgroundColor: isDarkMode ? '#374151' : 'white',
                  color: isDarkMode ? '#f3f4f6' : '#111827',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = isDarkMode ? '#fbb6ce' : '#e11d48';
                  e.target.style.boxShadow = isDarkMode
                    ? '0 0 0 3px rgba(251, 182, 206, 0.2)'
                    : '0 0 0 3px rgba(225, 29, 72, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isDarkMode ? '#4b5563' : '#fecaca';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" style={{
                color: isDarkMode ? '#e5e7eb' : '#374151'
              }}>
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || lockoutTime > 0}
                  required
                  className={isDarkMode ? "dark pr-10" : "pr-10"}
                  style={{
                    borderColor: isDarkMode ? '#4b5563' : '#fecaca',
                    backgroundColor: isDarkMode ? '#374151' : 'white',
                    color: isDarkMode ? '#f3f4f6' : '#111827',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = isDarkMode ? '#fbb6ce' : '#e11d48';
                    e.target.style.boxShadow = isDarkMode
                      ? '0 0 0 3px rgba(251, 182, 206, 0.2)'
                      : '0 0 0 3px rgba(225, 29, 72, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDarkMode ? '#4b5563' : '#fecaca';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  disabled={loading || lockoutTime > 0}
                  style={{
                    color: isDarkMode ? '#fbb6ce' : '#9f1239',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: loading || lockoutTime > 0 ? 'not-allowed' : 'pointer'
                  }}
                  onMouseOver={(e) => {
                    if (!loading && lockoutTime === 0) {
                      e.currentTarget.style.color = isDarkMode ? '#f9a8d4' : '#e11d48';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = isDarkMode ? '#fbb6ce' : '#9f1239';
                  }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {captchaError && (
              <Alert variant="destructive" style={{
                borderColor: isDarkMode ? '#9f1239' : '#fda4af',
                backgroundColor: isDarkMode ? '#2d1b1b' : '#fff1f2'
              }}>
                <AlertDescription style={{
                  color: isDarkMode ? '#fecaca' : '#be123c'
                }}>
                  {captchaError}
                </AlertDescription>
              </Alert>
            )}

            <div ref={turnstileContainerRef} id="turnstile-container-accounts" className="flex justify-center" />

            <Button
              type="submit"
              className="w-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || lockoutTime > 0 || !isCaptchaVerified}
              style={{
                background: isDarkMode
                  ? 'linear-gradient(135deg, #9f1239 0%, #7f1d1d 100%)'
                  : 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
                border: 'none',
                boxShadow: isDarkMode
                  ? '0 4px 6px rgba(159, 18, 57, 0.3)'
                  : '0 4px 6px rgba(225, 29, 72, 0.2)',
                color: 'white'
              }}
              onMouseOver={(e) => {
                if (!loading && lockoutTime === 0 && isCaptchaVerified) {
                  e.currentTarget.style.background = isDarkMode
                    ? 'linear-gradient(135deg, #be123c 0%, #9f1239 100%)'
                    : 'linear-gradient(135deg, #be123c 0%, #e11d48 100%)';
                  e.currentTarget.style.boxShadow = isDarkMode
                    ? '0 6px 8px rgba(190, 18, 60, 0.4)'
                    : '0 6px 8px rgba(190, 18, 60, 0.3)';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = isDarkMode
                  ? 'linear-gradient(135deg, #9f1239 0%, #7f1d1d 100%)'
                  : 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)';
                e.currentTarget.style.boxShadow = isDarkMode
                  ? '0 4px 6px rgba(159, 18, 57, 0.3)'
                  : '0 4px 6px rgba(225, 29, 72, 0.2)';
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="text-center text-sm mt-4" style={{
              color: isDarkMode ? '#9ca3af' : '#6b7280'
            }}>
              <p>For authorized accounts personnel only</p>
              <p className="text-xs mt-1">All activities are monitored and logged</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
