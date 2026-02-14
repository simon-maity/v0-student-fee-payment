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
  left: number // Horizontal position %
  duration: number // Speed
  delay: number // Stagger start
  scale: number // Size
  rotation: number // Initial rotation
  sway: number // Random horizontal sway
  top?: number // For people position
}

export default function HomePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // --- BEACH STATE ---
  const [coconuts, setCoconuts] = useState<BeachItem[]>([])
  const [people, setPeople] = useState<BeachItem[]>([])
  const [shootingStars, setShootingStars] = useState<BeachItem[]>([])

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

    // --- GENERATE BEACH ITEMS ---
    
    // Generate Coconuts (for both modes)
    const newCoconuts = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 8 + Math.random() * 12, // 8-20 seconds
      delay: Math.random() * -15,
      scale: 0.3 + Math.random() * 0.5,
      rotation: Math.random() * 360,
      sway: Math.random() * 40 - 20,
    }))
    setCoconuts(newCoconuts)

    // Generate People walking on beach (for both modes)
    const newPeople = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: 60 + Math.random() * 30, // Bottom portion of screen
      duration: 20 + Math.random() * 25, // 20-45 seconds
      delay: Math.random() * -20,
      scale: 0.4 + Math.random() * 0.4,
      rotation: 0,
      sway: Math.random() * 100 - 50,
    }))
    setPeople(newPeople)

    // Generate Shooting Stars (only for dark mode)
    const newShootingStars = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 3 + Math.random() * 4, // 3-7 seconds - fast!
      delay: Math.random() * -10,
      scale: 0.5 + Math.random() * 0.8,
      rotation: -25 + Math.random() * 10, // Diagonal angle
      sway: Math.random() * 200 - 100,
    }))
    setShootingStars(newShootingStars)

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
      bg-gradient-to-br from-sky-100 via-amber-50 to-sky-200
      dark:from-[#0a0f1a] dark:via-[#141b2b] dark:to-[#0b1424]
      text-gray-900 dark:text-white transition-all duration-300 overflow-x-hidden"
    >
      {/* --- INLINE STYLES FOR BEACH ANIMATION --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes coconutFall {
          0% { 
            transform: translateY(-20vh) rotate(0deg); 
            opacity: 0; 
          }
          20% { 
            opacity: 1; 
          }
          80% { 
            opacity: 1; 
          }
          100% { 
            transform: translateY(120vh) rotate(360deg) translateX(var(--sway)); 
            opacity: 0; 
          }
        }
        @keyframes peopleWalk {
          0% { 
            transform: translateX(-100vw) translateY(0); 
            opacity: 0; 
          }
          10% { 
            opacity: 1; 
          }
          90% { 
            opacity: 1; 
          }
          100% { 
            transform: translateX(100vw) translateY(var(--sway)); 
            opacity: 0; 
          }
        }
        @keyframes shootingStar {
          0% { 
            transform: translateX(-50vw) translateY(-30vh) rotate(-25deg); 
            opacity: 0; 
          }
          20% { 
            opacity: 1; 
          }
          80% { 
            opacity: 1; 
          }
          100% { 
            transform: translateX(50vw) translateY(30vh) rotate(-25deg); 
            opacity: 0; 
          }
        }
        .beach-coconut {
          position: absolute;
          top: 0;
          animation-name: coconutFall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          z-index: 0;
          pointer-events: none;
          will-change: transform;
        }
        .beach-people {
          position: absolute;
          bottom: 15%;
          animation-name: peopleWalk;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          z-index: 0;
          pointer-events: none;
          will-change: transform;
        }
        .shooting-star {
          position: absolute;
          top: 20%;
          animation-name: shootingStar;
          animation-timing-function: cubic-bezier(0.1, 0.8, 0.3, 1);
          animation-iteration-count: infinite;
          z-index: 0;
          pointer-events: none;
          filter: drop-shadow(0 0 10px rgba(255,255,255,0.8));
          will-change: transform;
        }
      `}} />

      {/* --- BEACH BACKGROUND LAYER --- */}
      <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-[1]">
        {/* Ocean horizon line */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-amber-300/30 to-transparent dark:from-blue-900/40 dark:to-transparent"></div>
        
        {/* Sand dunes effect */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-200/40 to-transparent dark:from-amber-900/20 dark:to-transparent"></div>
        
        {/* Coconut trees - static background elements */}
        <div className="absolute bottom-0 left-[5%] w-16 h-48 opacity-70 dark:opacity-50 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 w-2 h-40 bg-amber-800 dark:bg-amber-900 rounded-full"></div>
          <div className="absolute bottom-36 left-1/2 -translate-x-1/2 w-20 h-20 bg-green-700 dark:bg-green-900 rounded-full blur-sm"></div>
        </div>
        <div className="absolute bottom-0 right-[8%] w-20 h-56 opacity-70 dark:opacity-50 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 w-3 h-48 bg-amber-800 dark:bg-amber-900 rounded-full"></div>
          <div className="absolute bottom-44 left-1/2 -translate-x-1/2 w-24 h-24 bg-green-700 dark:bg-green-900 rounded-full blur-sm"></div>
        </div>
        <div className="absolute bottom-0 left-[15%] w-16 h-40 opacity-60 dark:opacity-40 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 w-2 h-32 bg-amber-800 dark:bg-amber-900 rounded-full"></div>
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 w-16 h-16 bg-green-700 dark:bg-green-900 rounded-full blur-sm"></div>
        </div>

        {/* FALLING COCONUTS - Both modes */}
        <div className="w-full h-full">
          {coconuts.map((coconut) => (
            <div
              key={`coconut-${coconut.id}`}
              className="beach-coconut"
              style={{
                left: `${coconut.left}%`,
                // @ts-ignore
                "--sway": `${coconut.sway}px`,
                animationDuration: `${coconut.duration}s`,
                animationDelay: `${coconut.delay}s`,
                width: `${30 * coconut.scale}px`,
                height: `${35 * coconut.scale}px`,
              }}
            >
              <div className="relative w-full h-full">
                {/* Coconut */}
                <svg viewBox="0 0 30 35" style={{ width: '100%', height: '100%' }}>
                  <ellipse cx="15" cy="17" rx="12" ry="14" fill="#6b4f3c" className="dark:fill-amber-800" />
                  <ellipse cx="17" cy="15" rx="3" ry="4" fill="#8b6b4f" className="dark:fill-amber-700" opacity="0.6" />
                  <path d="M10 10 Q 15 5 20 10" stroke="#4a3729" strokeWidth="2" fill="none" className="dark:stroke-amber-950" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* PEOPLE WALKING - Both modes */}
        <div className="w-full h-full">
          {people.map((person) => (
            <div
              key={`person-${person.id}`}
              className="beach-people"
              style={{
                bottom: `${person.top}%`,
                // @ts-ignore
                "--sway": `${person.sway}px`,
                animationDuration: `${person.duration}s`,
                animationDelay: `${person.delay}s`,
                width: `${25 * person.scale}px`,
                height: `${40 * person.scale}px`,
              }}
            >
              {/* Simple person silhouette */}
              <svg viewBox="0 0 20 30" style={{ width: '100%', height: '100%' }}>
                <circle cx="10" cy="8" r="5" fill="#4a4a4a" className="dark:fill-gray-300" opacity="0.7" />
                <rect x="7" y="13" width="6" height="12" fill="#4a4a4a" className="dark:fill-gray-300" opacity="0.7" />
                <line x1="5" y1="18" x2="15" y2="18" stroke="#4a4a4a" className="dark:stroke-gray-300" strokeWidth="2" opacity="0.7" />
                <line x1="7" y1="25" x2="3" y2="30" stroke="#4a4a4a" className="dark:stroke-gray-300" strokeWidth="2" opacity="0.7" />
                <line x1="13" y1="25" x2="17" y2="30" stroke="#4a4a4a" className="dark:stroke-gray-300" strokeWidth="2" opacity="0.7" />
              </svg>
            </div>
          ))}
        </div>

        {/* SHOOTING STARS - Dark mode only */}
        <div className="hidden dark:block w-full h-full">
          {shootingStars.map((star) => (
            <div
              key={`star-${star.id}`}
              className="shooting-star"
              style={{
                left: `${star.left}%`,
                animationDuration: `${star.duration}s`,
                animationDelay: `${star.delay}s`,
                transform: `rotate(${star.rotation}deg)`,
              }}
            >
              <svg width="60" height="10" viewBox="0 0 60 10" style={{ filter: 'drop-shadow(0 0 8px white)' }}>
                <defs>
                  <linearGradient id={`starGrad-${star.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="white" stopOpacity="1" />
                    <stop offset="70%" stopColor="white" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 5 L40 2 L60 5 L40 8 L0 5" fill={`url(#starGrad-${star.id})`} />
                <circle cx="45" cy="5" r="3" fill="white" opacity="0.8">
                  <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
          ))}
          
          {/* Extra sparkles for night mode */}
          {[...Array(30)].map((_, i) => (
            <div
              key={`sparkle-${i}`}
              className="absolute rounded-full bg-white"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 40}%`,
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                opacity: 0.3 + Math.random() * 0.5,
                animation: `pulse ${1 + Math.random() * 3}s infinite`,
                filter: 'blur(1px)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Background Glows - adjusted for beach theme */}
      <div className="absolute inset-0 pointer-events-none dark:block hidden z-[2]">
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full animate-pulse"></div>
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
