"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { Users, Award, ShieldHalf, GraduationCap, BookOpen, UserCheck, Monitor, Wrench, X, DollarSign } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

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

export default function HomePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // --- FESTIVAL STATE ---
  const [kites, setKites] = useState<FestivalItem[]>([])
  const [lanterns, setLanterns] = useState<FestivalItem[]>([])

  // --- SECRET MENU LOGIC ---
  const [showHidden, setShowHidden] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const handlePressStart = () => {
    // Start a 3-second timer when user touches/clicks
    timerRef.current = setTimeout(() => {
      setShowHidden(true)
    }, 3000)
  }

  const handlePressEnd = () => {
    // Cancel timer if they release early
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
  }
  // -------------------------

  useEffect(() => {
    setMounted(true)
    localStorage.removeItem("adminAuth")
    localStorage.removeItem("studentAuth")
    localStorage.removeItem("adminData")
    localStorage.removeItem("technicalTeamAuth")
    localStorage.removeItem("technicalTeamData")

    // --- GENERATE FESTIVAL ITEMS ---
    const kiteColors = ["text-red-500", "text-blue-600", "text-orange-500", "text-purple-600", "text-pink-500", "text-green-600", "text-yellow-500"];
    
    // Generate Kites (Light Mode)
    const newKites = Array.from({ length: 30 }).map((_, i) => ({
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
    const newLanterns = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 25 + Math.random() * 25,
      delay: Math.random() * -50,
      scale: 0.6 + Math.random() * 0.6,
      color: "text-orange-400",
      rotation: Math.random() * 10 - 5,
      sway: Math.random() * 60 - 30,
    }))
    setLanterns(newLanterns)

  }, [])

  if (!mounted)
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <div className="w-10 h-10 border-4 border-gray-400/30 dark:border-white/30 border-t-gray-800 dark:border-t-white rounded-full animate-spin" />
      </div>
    )

  // --- ROLE CONFIGURATION ---
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
      bg-gradient-to-br from-gray-100 via-white to-gray-200
      dark:from-[#0a0a0f] dark:via-[#1a1a28] dark:to-[#0f0f1a]
      text-gray-900 dark:text-white transition-all duration-300 overflow-x-hidden"
    >
      {/* --- INLINE STYLES FOR FESTIVAL ANIMATION --- */}
      <style dangerouslySetInnerHTML={{__html: `
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
      `}} />

      {/* --- FESTIVAL LAYER (FIXED BACKGROUND) --- */}
      <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-[1]">
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
                  width: `${60 * kite.scale}px`,
                  height: `${80 * kite.scale}px`,
                }}
              >
                <svg viewBox="0 0 50 70" fill="currentColor" style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.15))', width: '100%', height: '100%' }}>
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
                  <svg viewBox="0 0 50 60" fill="currentColor" style={{ width: '100%', height: '100%' }}>
                    <path d="M10 10 Q 5 30 10 50 L 40 50 Q 45 30 40 10 L 10 10 Z" fillOpacity="0.9" />
                    <ellipse cx="25" cy="10" rx="15" ry="5" fillOpacity="0.5" />
                    <path d="M20 50 L 20 55 M 30 50 L 30 55" stroke="currentColor" strokeWidth="2" />
                    <circle cx="25" cy="30" r="8" fill="#FFF" fillOpacity="0.8" className="animate-pulse" style={{filter: 'blur(4px)'}} />
                  </svg>
                </div>
              </div>
            ))}
          </div>
      </div>

      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none dark:block hidden z-[2]">
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-64 h-64 bg-cyan-500/20 blur-[100px] rounded-full animate-pulse"></div>
      </div>

      {/* Mode Toggle */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
        <ModeToggle />
      </div>

      {/* ✅ Hero Section */}
      <section className="relative z-10 flex flex-col justify-center items-center text-center min-h-screen container mx-auto px-4 md:px-6">
       
        {/* Logos */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 mb-6">
          <Image
            src="/images/gujarat-university-logo.png"
            alt="Gujarat University Logo"
            width={70}
            height={70}
            className="drop-shadow-xl hover:scale-110 transition"
          />
          <Image
            src="/images/gucpc-logo.png"
            alt="GUCPC Logo"
            width={110}
            height={55}
            className="drop-shadow-xl hover:scale-110 transition"
          />
        </div>

        {/* --- THE TRIGGER (Hold Samanvay Logo) --- */}
        <div
          className="flex items-center justify-center gap-3 md:gap-4 select-none cursor-pointer active:scale-95 transition-transform duration-200"
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          title=""
        >
          <Image
            src="/images/samanvay-logo.png"
            alt="Samanvay Logo"
            width={60}
            height={60}
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain"
          />
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight drop-shadow-lg">Samanvay</h1>
        </div>

        <p className="mt-4 text-base sm:text-lg md:text-2xl text-gray-600 dark:text-gray-300 max-w-md sm:max-w-xl mx-auto px-2">
          An Integrated Futuristic Campus Ecosystem — Bridging Students, Faculty & Innovation.
        </p>

        {/* --- VISIBLE BUTTON (STUDENT) --- */}
        <div className="flex justify-center mt-10 px-2">
          {studentRole && (
            <button
              onClick={() => router.push(studentRole.href)}
              className="group relative w-32 h-32 sm:w-40 sm:h-40
                bg-white/60 dark:bg-white/10
                backdrop-blur-xl border border-gray-300 dark:border-white/20
                hover:border-purple-500 dark:hover:border-purple-400
                rounded-2xl flex flex-col items-center justify-center
                transition-all duration-300 hover:scale-110
                hover:shadow-[0_0_25px_#a855f760]"
            >
              <studentRole.icon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-700 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition" />
              <span className="text-sm sm:text-lg font-semibold mt-3 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                {studentRole.name}
              </span>
            </button>
          )}
        </div>

        {/* --- HIDDEN BUTTONS (STAFF) - OPTIMIZED FOR MOBILE --- */}
        <AnimatePresence>
          {showHidden && (
            <motion.div
              layout // ✨ PERFORMANCE MAGIC: This enables GPU layout projection
              initial={{ opacity: 0, height: 0, scale: 0.98 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.98 }}
              transition={{
                duration: 0.4,
                ease: "circOut", // Faster easing for mobile responsiveness
              }}
              className="mt-8 w-full max-w-4xl overflow-hidden"
              // Force GPU layer for smoother paint
              style={{ willChange: "height, opacity" }}
            >
              <div className="p-6 rounded-3xl bg-gray-100/90 dark:bg-[#11111f]/90 border border-gray-200 dark:border-gray-800 backdrop-blur-sm mx-1">
                <div className="flex justify-between items-center mb-6 border-b border-gray-300 dark:border-gray-700 pb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Authorized Personnel
                  </span>
                  <button
                    onClick={() => setShowHidden(false)}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                  {staffRoles.map((role, idx) => (
                    <button
                      key={idx}
                      onClick={() => router.push(role.href)}
                      className="group relative w-24 h-24 sm:w-28 sm:h-28
                      bg-white/50 dark:bg-white/5
                      backdrop-blur-sm 
                      border border-gray-300 dark:border-white/10
                      hover:border-cyan-500 dark:hover:border-cyan-400
                      rounded-xl flex flex-col items-center justify-center
                      transition-all duration-300 hover:scale-105
                      active:scale-95" // Added click feedback for mobile
                    >
                      <role.icon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600 dark:text-gray-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition" />
                      <span className="text-xs sm:text-sm mt-2 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">
                        {role.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-6 text-gray-500 dark:text-gray-400 animate-bounce text-sm">Scroll Down ↓</div>
      </section>

      {/* ✅ Achievements */}
      <motion.section
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.3 }}
        className="relative z-10 py-16 sm:py-20 bg-white dark:bg-[#0f0f1a] px-4 sm:px-6"
      >
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-10">
            Our Achievements
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: GraduationCap, number: "4000+", label: "Students Enrolled" },
              { icon: UserCheck, number: "120+", label: "Expert Faculty" },
              { icon: BookOpen, number: "34+", label: "Courses Offered" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="p-6 sm:p-8 rounded-2xl border border-gray-300 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-lg shadow-lg hover:shadow-[0_0_20px_#00ffff40] transition-all"
              >
                <stat.icon className="w-9 h-9 sm:w-10 sm:h-10 mx-auto text-cyan-500 mb-3" />
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stat.number}</h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ✅ About CPC */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.3 }}
        className="relative z-10 py-16 sm:py-20 px-4 md:px-20 bg-gray-50 dark:bg-[#0f0f1a]"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 sm:gap-12">
          <div className="w-full md:w-1/2 rounded-2xl overflow-hidden shadow-xl hover:scale-[1.02] transition">
            <Image
              src="/images/cpc-building.jpg"
              alt="CPC Building"
              width={1000}
              height={600}
              className="rounded-2xl object-cover w-full h-auto"
            />
          </div>

          <div className="w-full md:w-1/2 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              About Centre for Professional Courses (CPC)
            </h2>
            <p className="leading-relaxed mb-3">
              Centre for Professional Courses (CPC) is one of Gujarat University's youngest departments, established in
              2023. It stands at par with excellence, fostering modern education for a dynamic world.
            </p>
            <p className="leading-relaxed mb-3">
              It is situated in the lush green campus of Gujarat University, offering a peaceful and inspiring academic
              environment.
            </p>
            <p className="leading-relaxed">
              CPC provides multidisciplinary programmes like Animation, Cyber Security, Software Development, Cloud
              Technology, Mobile Apps, Fintech, Aviation & Financial Services — leading to B.Sc., M.Sc., MBA degrees,
              and more.
            </p>
          </div>
        </div>
      </motion.section>

      {/* ✅ Director Message */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        viewport={{ once: true, amount: 0.3 }}
        className="relative z-10 py-16 sm:py-20 px-4 md:px-20 bg-white dark:bg-[#11111f]"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 sm:gap-12">
          <div className="w-full md:w-1/3 rounded-2xl overflow-hidden shadow-xl hover:scale-[1.02] transition">
            <Image
              src="/images/director.jpeg"
              alt="Director Dr. Paavan Pandit"
              width={600}
              height={700}
              className="rounded-2xl object-cover w-full h-auto"
            />
          </div>

          <div className="w-full md:w-2/3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Director's Message
            </h2>
            <p className="leading-relaxed mb-3 italic">
              "In today's fast-paced world, new-age skills are in high demand. Our Centre for Professional Courses
              offers cutting-edge programs to meet these needs. We provide a variety of Master, Integrated Master, and
              Bachelor Programmes across multiple departments."
            </p>
            <p className="leading-relaxed mb-3 italic">
              Our vision is to create an innovative and excellent learning environment. We continuously update our
              curriculum to align with the latest industry trends and technological advancements.
            </p>
            <p className="leading-relaxed italic">
              Join us on this exciting journey as we prepare the next generation of professionals to thrive and lead in
              a dynamic global environment."
            </p>
            <p className="mt-5 font-semibold text-base sm:text-lg text-gray-900 dark:text-white">~ Dr. Paavan Pandit</p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Director, Centre for Professional Courses (CPC)
            </p>
          </div>
        </div>
      </motion.section>

      {/* ✅ Developer Message */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        viewport={{ once: true, amount: 0.3 }}
        className="relative z-10 py-16 sm:py-20 px-4 md:px-20 bg-gray-50 dark:bg-[#0f0f1a]"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 sm:gap-12">
          <div className="w-full md:w-1/3 rounded-2xl overflow-hidden shadow-xl hover:scale-[1.02] transition">
            <Image
              src="/images/developer.jpg"
              alt="Developer"
              width={600}
              height={700}
              className="rounded-2xl object-cover w-full h-auto"
            />
          </div>

          <div className="w-full md:w-2/3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Developer’s Message
            </h2>
            <p className="leading-relaxed mb-3 italic">
              "Samanvay is not just a project — it's a vision to bring every academic and administrative function under
              one smart digital ecosystem. The goal is to simplify processes, enhance transparency, and make Gujarat
              University a leader in futuristic campus management."
            </p>
            <p className="leading-relaxed mb-3 italic">
              This system integrates every aspect — from student life and faculty management to innovation and
              automation. Designed with performance and scalability in mind, Samanvay aims to shape the next era of
              digital education.
            </p>
            <p className="leading-relaxed italic">
              With passion and precision, we strive to make technology empower education."
            </p>
            <p className="mt-5 font-semibold text-base sm:text-lg text-gray-900 dark:text-white">~ Simon Maity</p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Developer Team - GUCPC Gujarat University — Samanvay Project
            </p>
          </div>
        </div>
      </motion.section>

      {/* ✅ Footer */}
      <footer className="relative z-10 text-center py-5 sm:py-6 border-t border-gray-300 dark:border-gray-700/40">
        <Link href="/terms" className="inline-block group transition-all duration-300">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
            © 2025 Avinya Project by Simon Maity All Rights Reserved. | Samanvay ERP | Developed for GUCPC, Gujarat
            University.
          </p>
        </Link>
      </footer>
    </div>
  )
}
