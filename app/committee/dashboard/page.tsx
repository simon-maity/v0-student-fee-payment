"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LogOut, Package, History, Clock, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 10 },
  },
}

export default function CommitteeDashboard() {
  const [committeeData, setCommitteeData] = useState<any>(null)
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem("committeeAuth")
      const data = localStorage.getItem("committeeData")

      if (!auth || !data) {
        router.push("/committee/login")
        return
      }

      try {
        const parsed = JSON.parse(data)
        setCommitteeData(parsed)
        fetchStats(auth)
      } catch (error) {
        console.error("Failed to parse committee data:", error)
        router.push("/committee/login")
      }
    }

    checkAuth()
  }, [router])

  const fetchStats = async (token: string) => {
    try {
      const response = await fetch("/api/committee/stationery/requests", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        const requests = data.requests || []
        setStats({
          total: requests.length,
          pending: requests.filter((r: any) => r.status === "pending").length,
          approved: requests.filter((r: any) => r.status === "approved").length,
        })
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("committeeAuth")
    localStorage.removeItem("committeeData")
    router.push("/committee/login")
  }

  if (loading || !committeeData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-black">
        <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
      </div>
    )
  }

  const greeting = new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 18 ? "Good Afternoon" : "Good Evening"

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-gray-100 transition-colors duration-500">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/50 via-white to-slate-100 dark:hidden" />
        <div className="hidden dark:block absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="hidden dark:block absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[150px]" />
        <div className="hidden dark:block absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-slate-800/20 blur-[150px]" />
      </div>

      <motion.div
        className="container relative z-10 mx-auto px-4 sm:px-6 py-8 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:via-gray-200 dark:to-gray-500 bg-clip-text text-transparent">
              {greeting}, {committeeData.name}
            </h1>
            <p className="text-lg text-muted-foreground dark:text-gray-400">Committee Portal</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="gap-2 bg-white/50 dark:bg-white/5 backdrop-blur-sm border-slate-200 dark:border-white/10">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/70 dark:bg-zinc-950/40 border-slate-200 dark:border-white/10 backdrop-blur-md">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600">
                <Package className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 dark:bg-zinc-950/40 border-slate-200 dark:border-white/10 backdrop-blur-md">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 dark:bg-zinc-950/40 border-slate-200 dark:border-white/10 backdrop-blur-md">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.approved}</p>
              </div>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Feature Card */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6">
          <Card className="bg-white/70 dark:bg-zinc-950/40 border-slate-200 dark:border-white/10 backdrop-blur-md shadow-lg border-t-4 border-t-blue-500 cursor-pointer hover:shadow-xl transition-shadow group" onClick={() => router.push("/committee/stationery")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Stationery Requests</CardTitle>
                    <CardDescription>Request office supplies and inventory items</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Requests</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>{stats.pending} Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{stats.approved} Approved</span>
                </div>
              </div>
              <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                <Package className="w-4 h-4 mr-2" />
                Manage Requests
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center text-sm text-muted-foreground text-xs">
          <p>Committee Portal © {new Date().getFullYear()}</p>
        </motion.div>
      </motion.div>
    </div>
  )
}
