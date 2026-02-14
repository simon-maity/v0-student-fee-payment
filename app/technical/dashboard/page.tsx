"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PersonnelAttendanceCard } from "@/components/personnel-attendance-card"
import {
  Monitor,
  Calendar,
  Users,
  FileText,
  ClipboardList,
  LogOut,
  Sparkles,
  Zap,
  Codesandbox,
  Cpu,
  Server,
  Activity,
  ChevronRight,
  ShieldCheck,
  Wrench,
  Tickets,
  UserCircle
} from "lucide-react"

// --- Animation Variants (Same as Admin) ---
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

export default function TechnicalTeamDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [greeting, setGreeting] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Dynamic Greeting
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good Morning")
    else if (hour < 18) setGreeting("Good Afternoon")
    else setGreeting("Good Evening")

    const checkAuth = () => {
      const token = localStorage.getItem("technicalTeamAuth")
      const data = localStorage.getItem("technicalTeamData")

      if (!token || !data) {
        router.push("/technical/login")
        return
      }

      try {
        setUserData(JSON.parse(data))
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Failed to parse technical team data:", error)
        localStorage.removeItem("technicalTeamAuth")
        localStorage.removeItem("technicalTeamData")
        router.push("/technical/login")
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("technicalTeamAuth")
    localStorage.removeItem("technicalTeamData")
    router.push("/technical/login")
  }

  if (!isAuthenticated || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-black">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-emerald-500 animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-gray-100 transition-colors duration-500">
      
      {/* Background Ambience & Grid (Same as Admin) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Light Mode Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/50 dark:hidden" />
        
        {/* Dark Mode: The Void & Grid */}
        <div className="hidden dark:block absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="hidden dark:block absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/20 blur-[150px]" />
        <div className="hidden dark:block absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-900/20 blur-[150px]" />
      </div>

      <motion.div 
        className="container relative z-10 mx-auto px-4 sm:px-6 py-8 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* --- Header Section --- */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:via-gray-200 dark:to-gray-500 bg-clip-text text-transparent">
              {greeting}, {userData.name}
            </h1>
            <p className="text-lg text-muted-foreground dark:text-gray-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Technical Operations Center
            </p>
          </div>
          <div className="flex gap-3">
             <span className="px-4 py-1.5 text-sm font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 rounded-full flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Technical Admin
            </span>
            <Button onClick={handleLogout} variant="destructive" size="sm" className="rounded-full px-4">
               <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </motion.div>

        {/* --- Hero Stats Grid (Mock Data for Visual Consistency) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="System Status" value="Online" icon={Activity} color="green" subValue="All Systems Operational" href="#" />
          <StatCard title="PC Requests" value="Pending" icon={Monitor} color="blue" subValue="Check Exam Schedule" href="/technical/pc-requests" />
          <StatCard title="Inventory" value="Manage" icon={Codesandbox} color="orange" subValue="Stationery & Stock" href="/technical/stationery" />
          <StatCard title="Leaves" value="Action" icon={FileText} color="purple" subValue="Your Balance & Requests" href="/technical/leaves" />
        </div>

        {/* --- Bento Grid: Profile & Quick Actions --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Attendance Card */}
          <motion.div variants={itemVariants} className="lg:col-span-4">
            {typeof window !== "undefined" && <PersonnelAttendanceCard personnelId={userData?.id || 0} userType="technical_team" />}
          </motion.div>

          {/* Main Info Block (Replaces Admin Analytics) */}
          <motion.div variants={itemVariants} className="lg:col-span-8">
            <Card className="h-full bg-white/70 dark:bg-zinc-950/40 border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-sm dark:shadow-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-foreground dark:text-white">
                  <Server className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  Infrastructure Overview
                </CardTitle>
                <CardDescription className="dark:text-gray-400">Manage lab infrastructure and support requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-zinc-900/50 dark:to-zinc-900/30 border border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center gap-6">
                    <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/30">
                        <UserCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 space-y-1 text-center md:text-left">
                        <h3 className="text-2xl font-bold text-foreground dark:text-white">{userData.name}</h3>
                        <p className="text-muted-foreground dark:text-gray-400">{userData.email}</p>
                        <p className="text-sm font-mono bg-slate-200 dark:bg-zinc-800 px-2 py-1 rounded inline-block">@{userData.username}</p>
                    </div>
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                        <Link href="/technical/pc-requests">
                             <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">View Requests</Button>
                        </Link>
                    </div>
                 </div>

                 <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    <Monitor className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                    <p className="text-sm font-semibold text-foreground dark:text-gray-200">Labs</p>
                    <p className="text-xs text-muted-foreground">Monitoring</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    <Cpu className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                    <p className="text-sm font-semibold text-foreground dark:text-gray-200">Hardware</p>
                    <p className="text-xs text-muted-foreground">Maintenance</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    <Wrench className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                    <p className="text-sm font-semibold text-foreground dark:text-gray-200">Tickets</p>
                    <p className="text-xs text-muted-foreground">Support</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions Grid */}
          <motion.div variants={itemVariants} className="lg:col-span-8 flex flex-col gap-6">
            <Card className="flex-1 bg-white/70 dark:bg-zinc-950/40 border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-sm dark:shadow-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-foreground dark:text-white">
                  <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <QuickActionBtn href="/technical/pc-requests" icon={Monitor} label="PC Setup" color="blue" />
                <QuickActionBtn href="/technical/stationery" icon={Codesandbox} label="Stock" color="orange" />
                <QuickActionBtn href="/technical/leaves" icon={Calendar} label="Apply Leave" color="purple" />
                <QuickActionBtn href="/technical/peon-leaves" icon={ClipboardList} label="Staff Logs" color="teal" />
              </CardContent>
            </Card>

            <Link href="/technical/leaves">
              <Card className="bg-gradient-to-br from-emerald-900 to-teal-900 dark:from-zinc-900 dark:to-black border-slate-200 dark:border-zinc-800 hover:border-emerald-500/50 transition-all group cursor-pointer h-full shadow-lg">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300 dark:text-gray-400 mb-1">Your Leave Balance</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white">View</span>
                      <span className="text-xs text-emerald-400 font-medium">Status</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-emerald-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>

        {/* --- Management Section Header --- */}
        <div className="flex items-center gap-4 py-4">
          <h2 className="text-2xl font-bold text-foreground dark:text-white">Management Console</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-slate-200 dark:from-zinc-800 to-transparent" />
        </div>

        {/* --- Management Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
          
          <ManagementCard 
            title="PC Requests" 
            desc="Exam Setup & Labs" 
            icon={Monitor} 
            color="green"
            links={[
              { label: "View Requests", href: "/technical/pc-requests" },
              { label: "Lab Config", href: "/technical/pc-requests" }
            ]}
          />

          <ManagementCard 
            title="Leave Management" 
            desc="Personal Leaves" 
            icon={FileText} 
            color="blue"
            links={[
              { label: "Apply for Leave", href: "/technical/leaves" },
              { label: "History", href: "/technical/leaves" }
            ]}
          />

          <ManagementCard 
            title="Peon Review" 
            desc="Staff Oversight" 
            icon={ClipboardList} 
            color="purple"
            links={[
              { label: "Review Requests", href: "/technical/peon-leaves" }
            ]}
          />

          <ManagementCard 
            title="Inventory" 
            desc="Stationery & Items" 
            icon={Codesandbox} 
            color="orange"
            links={[
              { label: "Manage Stock", href: "/technical/stationery" },
              { label: "Requests", href: "/technical/stationery" }
            ]}
          />

          <ManagementCard 
            title="Tickets"
            desc="Claim & Resolve Tickets" 
            icon={Tickets} 
            color="orange"
            links={[
              { label: "Manage Tickets", href: "/technical/tickets" }
            ]}
          />

        </div>
      </motion.div>
    </div>
  )
}

// --- Sub Components (Exactly matching Admin Dashboard) ---

const getColorClasses = (color: string) => {
    const maps: any = {
        blue: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
        green: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
        purple: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
        orange: "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
        indigo: "text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800",
        pink: "text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800",
        red: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800",
        teal: "text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800",
        yellow: "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
        cyan: "text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800",
        slate: "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700",
    }
    return maps[color] || maps.blue
}

function StatCard({ title, value, icon: Icon, color, subValue, href }: any) {
  const colorClass = getColorClasses(color)

  return (
    <motion.div variants={itemVariants}>
      <Link href={href} className="block h-full">
        <Card className="h-full bg-white/70 dark:bg-zinc-950/40 border-slate-200 dark:border-white/10 backdrop-blur-md hover:translate-y-[-5px] transition-all duration-300 group cursor-pointer hover:shadow-lg dark:hover:shadow-emerald-500/10 hover:border-emerald-500/50">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">{title}</p>
              <h3 className="text-3xl font-bold text-foreground dark:text-white mt-2">{value}</h3>
              {subValue && (
                <p className="text-xs font-medium text-muted-foreground/80 dark:text-gray-500 mt-1">{subValue}</p>
              )}
            </div>
            <div className={cn("p-3 rounded-xl transition-colors border", colorClass)}>
              <Icon className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

function QuickActionBtn({ href, icon: Icon, label, color }: any) {
  const colorClass = getColorClasses(color)
  
  return (
    <Link href={href}>
      <div className={cn("flex flex-col items-center justify-center p-3 rounded-xl border transition-all hover:scale-105 cursor-pointer h-24 gap-2 bg-white/50 dark:bg-zinc-900/20", colorClass)}>
        <Icon className="w-6 h-6" />
        <span className="text-xs font-semibold">{label}</span>
      </div>
    </Link>
  )
}

function ManagementCard({ title, desc, icon: Icon, color, links, isHazard }: any) {
  const iconColorMap: any = {
      blue: "text-blue-500",
      orange: "text-orange-500",
      emerald: "text-emerald-500",
      cyan: "text-cyan-500",
      indigo: "text-indigo-500",
      purple: "text-purple-500",
      slate: "text-slate-500",
      pink: "text-pink-500",
      red: "text-red-500",
      green: "text-green-500",
      yellow: "text-yellow-500",
  }
  const iconColor = iconColorMap[color] || "text-blue-500"
  
  const cardBorder = isHazard 
    ? "border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10" 
    : "border-slate-200 dark:border-white/10 bg-white/70 dark:bg-zinc-950/40"

  return (
    <motion.div variants={itemVariants}>
      <Card className={cn("h-full backdrop-blur-md hover:border-slate-400 dark:hover:border-white/30 transition-all group overflow-hidden shadow-sm hover:shadow-md", cardBorder)}>
        <div className="absolute top-0 right-0 p-4 opacity-[0.05] dark:opacity-[0.05] group-hover:opacity-10 dark:group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500 pointer-events-none">
          <Icon className={cn("w-24 h-24", iconColor)} />
        </div>
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3 text-foreground dark:text-white">
            <div className={cn("p-2 rounded-lg bg-slate-100 dark:bg-zinc-900", iconColor)}>
              <Icon className="w-5 h-5" />
            </div>
            {title}
          </CardTitle>
          <CardDescription className="text-muted-foreground dark:text-gray-400">{desc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 relative z-10">
          {links.map((link: any, i: number) => (
            <Link key={i} href={link.href}>
              <Button variant="ghost" className="w-full justify-between text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 group/btn">
                {link.label}
                <ChevronRight className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              </Button>
            </Link>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}
