"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Users, Lock } from "lucide-react"

export default function CommitteeLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/committee/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, token: "captcha-not-required" }),
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem("committeeAuth", data.token)
        localStorage.setItem("committeeData", JSON.stringify(data.committee))
        toast({ title: "Success", description: "Login successful" })
        router.push("/committee/dashboard")
      } else {
        toast({ title: "Error", description: data.message || "Login failed", variant: "destructive" })
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({ title: "Error", description: "Login failed", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-gray-100 transition-colors duration-500 flex items-center justify-center px-4">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/50 via-white to-slate-100 dark:hidden" />
        <div className="hidden dark:block absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="hidden dark:block absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[150px]" />
        <div className="hidden dark:block absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-slate-800/20 blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-white/70 dark:bg-zinc-950/40 border-slate-200 dark:border-white/10 backdrop-blur-md shadow-xl">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Committee Portal</CardTitle>
            <CardDescription className="text-center">Sign in to your committee account</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-white/50 dark:bg-zinc-900/50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/50 dark:bg-zinc-900/50"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Committee Portal © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  )
}
