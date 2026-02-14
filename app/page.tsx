"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { Users, Award, ShieldHalf, GraduationCap, BookOpen, UserCheck, Monitor, Wrench, X, DollarSign } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

// --- BEACH CONFIGURATION ---
interface BeachItem {
  id: number
  left: number
  duration: number
  delay: number
  scale: number
  type: "cloud" | "person" | "star" | "tree"
}

export default function HomePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // --- THEME STATE ---
  const [beachItems, setBeachItems] = useState<BeachItem[]>([])
  const [stars, setStars] = useState<BeachItem[]>([])

  // --- SECRET MENU LOGIC ---
  const [showHidden, setShowHidden] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const handlePressStart = () => {
    timerRef.current = setTimeout(() => {
      setShowHidden(true)
    }, 3000)
  }

  const handlePressEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
  }

  useEffect(() => {
    setMounted(true)
    localStorage.removeItem("adminAuth")
    localStorage.removeItem("studentAuth")
    localStorage.removeItem("adminData")
    localStorage.removeItem("technicalTeamAuth")
    localStorage.removeItem("technicalTeamData")

    // Generate Clouds & People (Light Mode)
    const items = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 20 + Math.random() * 40,
      delay: Math.random() * -40,
      scale: 0.8 + Math.random() * 1,
      type: i % 2 === 0 ? "cloud" : "person" as const,
    }))
    setBeachItems(items)

    // Generate Shooting Stars (Dark Mode)
    const newStars = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 2 + Math.random() * 4,
      delay: Math.random() * -20,
      scale: 1,
      type: "star" as const,
    }))
    setStars(newStars)
  }, [])

  if (!mounted)
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <div className="w-10 h-10 border-4 border-gray-400/30 dark:border-white/30 border-t-gray-800 dark:border-t-white rounded-full animate-spin" />
      </div>
    )

  const allRoles = [
    { name: "Student", icon: Users, href: "/student/login" },
    { name: "Admin", icon: Award, href: "/admin/login" },
    { name: "Personnel", icon: ShieldHalf, href: "/admin-personnel/login" },
    { name: "Accounts", icon: DollarSign, href: "/accounts-personnel/login" },
    { name: "Tutor", icon: Users, href: "/tutor/login" },
    { name: "Technical", icon: Monitor, href: "/technical/login" },
    { name: "Peon", icon: Wrench, href: "/peon/login" },
  ]

  const studentRole = allRoles.find((r) => r.name === "Student")
  const staffRoles = allRoles.filter((r) => r.name !== "Student")

  return (
    <div
      className="relative min-h-screen 
      bg-gradient-to-b from-cyan-100 via-blue-50 to-orange-100
      dark:from-[#020617] dark:via-[#0f172a] dark:to-[#1e1b4b]
      text-gray-900 dark:text-white transition-all duration-700 overflow-x-hidden"
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes drift {
          from { transform: translateX(-10vw); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          to { transform: translateX(110vw); opacity: 0; }
        }
        @keyframes walk {
          from { transform: translateX(110vw); }
          to { transform: translateX(-10vw); }
        }
        @keyframes shoot {
          0% { transform: translateX(0) translateY(0) rotate(-45deg) scale(0); opacity: 0; }
          10% { opacity: 1; scale: 1; }
          100% { transform: translateX(-500px) translateY(500px) rotate(-45deg) scale(0); opacity: 0; }
        }
        @keyframes sway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes wave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }
        .beach-cloud { animation: drift linear infinite; position: absolute; }
        .beach-person { animation: walk linear infinite; position: absolute; bottom: 10%; opacity: 0.8; }
        .shooting-star { animation: shoot linear infinite; position: absolute; }
        .palm-tree { animation: sway ease-in-out infinite; transform-origin: bottom; }
        .sea-water { animation: wave ease-in-out 4s infinite; }
      `}} />

      {/* --- SCENIC LAYER --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        
        {/* LIGHT MODE: BEACH SCENE */}
        <div className="block dark:hidden w-full h-full">
           {/* Sun */}
           <div className="absolute top-20 right-20 w-32 h-32 bg-orange-200 rounded-full blur-3xl opacity-60" />
           
           {/* Clouds & People */}
           {beachItems.map((item) => (
             item.type === "cloud" ? (
               <div key={item.id} className="beach-cloud text-white/80" style={{ top: `${15 + (item.id * 5)}%`, animationDuration: `${item.duration}s`, animationDelay: `${item.delay}s` }}>
                 <div className="w-24 h-8 bg-current rounded-full blur-xl" style={{ transform: `scale(${item.scale})` }} />
               </div>
             ) : (
               <div key={item.id} className="beach-person text-gray-400" style={{ animationDuration: `${item.duration}s`, animationDelay: `${item.delay}s` }}>
                 <Users size={20 * item.scale} />
               </div>
             )
           ))}

           {/* Palm Trees */}
           <div className="absolute bottom-0 left-4 palm-tree text-emerald-800/20">
              <div className="w-1 h-64 bg-amber-900/20 rounded-t-full" />
              <div className="absolute top-0 -left-10 w-20 h-4 bg-emerald-600/20 rounded-full rotate-45" />
              <div className="absolute top-4 -right-10 w-20 h-4 bg-emerald-600/20 rounded-full -rotate-45" />
           </div>

           {/* Ocean Waves (Bottom) */}
           <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-cyan-300/40 to-transparent sea-water" />
        </div>

        {/* DARK MODE: NIGHT OCEAN */}
        <div className="hidden dark:block w-full h-full">
            {/* Moon Glow */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />
            
            {/* Shooting Stars */}
            {stars.map((star) => (
              <div key={star.id} className="shooting-star top-0" style={{ left: `${star.left}%`, animationDuration: `${star.duration}s`, animationDelay: `${star.delay}s` }}>
                <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-blue-200 to-white" />
              </div>
            ))}

            {/* Bioluminescent Waves */}
            <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-blue-900/50 to-transparent">
               <div className="w-full h-2 bg-cyan-400/20 blur-md sea-water" />
            </div>

            {/* Night Palms */}
            <div className="absolute bottom-0 right-10 palm-tree opacity-20">
                <div className="w-2 h-80 bg-black" />
                <div className="absolute top-0 -left-16 w-32 h-6 bg-black rounded-full rotate-12" />
            </div>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
        <ModeToggle />
      </div>

      {/* ✅ Hero Section */}
      <section className="relative z-10 flex flex-col justify-center items-center text-center min-h-screen container mx-auto px-4">
        
        {/* Logos */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 mb-6">
          <Image src="/images/gujarat-university-logo.png" alt="Logo" width={70} height={70} className="drop-shadow-2xl hover:scale-110 transition duration-500" />
          <Image src="/images/gucpc-logo.png" alt="Logo" width={110} height={55} className="drop-shadow-2xl hover:scale-110 transition duration-500" />
        </div>

        {/* --- TRIGGER --- */}
        <div
          className="flex items-center justify-center gap-3 md:gap-4 select-none cursor-pointer active:scale-95 transition-all"
          onMouseDown={handlePressStart} onMouseUp={handlePressEnd} onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart} onTouchEnd={handlePressEnd}
        >
          <Image src="/images/samanvay-logo.png" alt="Samanvay Logo" width={60} height={60} className="w-10 h-10 sm:w-16 sm:h-16" />
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_0_30px_rgba(56,189,248,0.4)]">
            Samanvay
          </h1>
        </div>

        <p className="mt-6 text-base sm:text-xl text-gray-600 dark:text-blue-100/70 max-w-xl font-medium">
          A Coastal Breeze of Innovation — Bridging Students, Faculty & The Future.
        </p>

        {/* --- VISIBLE BUTTON --- */}
        <div className="mt-12">
          {studentRole && (
            <button
              onClick={() => router.push(studentRole.href)}
              className="group relative w-36 h-36 sm:w-44 sm:h-44
                bg-white/40 dark:bg-blue-950/20 backdrop-blur-2xl
                border border-white/50 dark:border-blue-400/20
                rounded-[2.5rem] flex flex-col items-center justify-center
                transition-all duration-500 hover:scale-110
                hover:shadow-[0_20px_50px_rgba(8,145,178,0.3)] dark:hover:shadow-[0_0_40px_rgba(56,189,248,0.2)]"
            >
              <studentRole.icon className="w-12 h-12 text-cyan-600 dark:text-cyan-400" />
              <span className="text-lg font-bold mt-4 text-cyan-900 dark:text-white">{studentRole.name}</span>
            </button>
          )}
        </div>

        {/* --- HIDDEN STAFF MENU --- */}
        <AnimatePresence>
          {showHidden && (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="mt-10 w-full max-w-4xl"
            >
              <div className="p-8 rounded-[3rem] bg-white/60 dark:bg-[#020617]/80 border border-white/40 dark:border-blue-500/20 backdrop-blur-3xl shadow-2xl">
                <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-blue-900/50 pb-4">
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-400">Personnel Portal</span>
                  <button onClick={() => setShowHidden(false)} className="hover:rotate-90 transition-transform"><X size={24} /></button>
                </div>
                <div className="flex flex-wrap justify-center gap-6">
                  {staffRoles.map((role, idx) => (
                    <button
                      key={idx}
                      onClick={() => router.push(role.href)}
                      className="group w-24 h-24 sm:w-32 sm:h-32 bg-white/50 dark:bg-blue-900/10 border border-white dark:border-blue-400/10 rounded-3xl flex flex-col items-center justify-center transition-all hover:bg-cyan-500 hover:text-white"
                    >
                      <role.icon className="w-8 h-8 group-hover:scale-110 transition" />
                      <span className="text-xs sm:text-sm font-bold mt-3">{role.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-10 text-cyan-600 dark:text-cyan-400/50 animate-bounce">
           <p className="text-xs tracking-widest uppercase font-bold">Explore the Coast</p>
        </div>
      </section>

      {/* ✅ Achievements */}
      <motion.section 
        className="relative z-10 py-24 bg-white/80 dark:bg-[#020617]/90 backdrop-blur-md"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-black text-center mb-16 dark:text-blue-50">Our Horizon</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: GraduationCap, number: "4000+", label: "Students Navigating" },
              { icon: UserCheck, number: "120+", label: "Expert Captains" },
              { icon: BookOpen, number: "34+", label: "Academic Streams" },
            ].map((stat, i) => (
              <div key={i} className="p-10 rounded-[2.5rem] bg-gradient-to-br from-white to-cyan-50 dark:from-blue-950/20 dark:to-transparent border border-cyan-100 dark:border-blue-500/10 text-center">
                <stat.icon className="w-12 h-12 mx-auto text-cyan-500 mb-4" />
                <h3 className="text-4xl font-black mb-2">{stat.number}</h3>
                <p className="text-gray-500 dark:text-blue-200/50 font-medium uppercase tracking-wider text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ✅ About / Messages (Kept exact as requested) */}
      <section className="relative z-10 py-20 px-6 space-y-32 max-w-6xl mx-auto">
          {/* About CPC */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2 rounded-[2rem] overflow-hidden shadow-2xl"><Image src="/images/cpc-building.jpg" alt="Building" width={1000} height={600} className="object-cover" /></div>
            <div className="w-full md:w-1/2">
               <h2 className="text-4xl font-bold mb-6">About CPC</h2>
               <p className="text-lg text-gray-600 dark:text-blue-100/60 leading-relaxed">Established in 2023, the Centre for Professional Courses stands at the peak of modern education within Gujarat University's lush campus.</p>
            </div>
          </div>

          {/* Director */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="w-full md:w-1/3 rounded-[2rem] overflow-hidden shadow-2xl"><Image src="/images/director.jpeg" alt="Director" width={600} height={700} className="object-cover" /></div>
            <div className="w-full md:w-2/3">
               <h2 className="text-4xl font-bold mb-6">Director's Message</h2>
               <p className="text-xl italic text-cyan-700 dark:text-cyan-300">"Our vision is to create an innovative and excellent learning environment, preparing the next generation to lead in a dynamic global environment."</p>
               <p className="mt-6 font-black text-xl">~ Dr. Paavan Pandit</p>
            </div>
          </div>

          {/* Developer */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/3 rounded-[2rem] overflow-hidden shadow-2xl"><Image src="/images/developer.jpg" alt="Developer" width={600} height={700} className="object-cover" /></div>
            <div className="w-full md:w-2/3">
               <h2 className="text-4xl font-bold mb-6">Developer’s Message</h2>
               <p className="text-xl italic text-gray-600 dark:text-blue-100/60">"Samanvay is a vision to bring every academic and administrative function under one smart digital ecosystem. We strive to make technology empower education."</p>
               <p className="mt-6 font-black text-xl">~ Simon Maity</p>
               <p className="text-cyan-600 font-bold uppercase tracking-widest text-sm">Developer Team - GUCPC</p>
            </div>
          </div>
      </section>

      {/* ✅ Footer */}
      <footer className="relative z-10 py-10 border-t border-cyan-500/10 text-center">
        <Link href="/terms">
          <p className="text-sm text-gray-500 hover:text-cyan-500 transition">
            © 2025 Avinya Project by Simon Maity | Samanvay ERP | Gujarat University
          </p>
        </Link>
      </footer>
    </div>
  )
}
