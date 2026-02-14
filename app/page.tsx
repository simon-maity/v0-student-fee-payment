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
    const newCoconuts = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 8 + Math.random() * 12, // 8-20 seconds
      delay: Math.random() * -15,
      scale: 0.3 + Math.random() * 0.5,
      rotation: Math.random() * 360,
      sway: Math.random() * 40 - 20,
    }))
    setCoconuts(newCoconuts)

    // Generate People walking on beach (for both modes) - FIXED: Now they walk on the ground
    const newPeople = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: 85 + Math.random() * 10, // Near bottom of screen (85-95% from top)
      duration: 25 + Math.random() * 30, // 25-55 seconds - slower walking
      delay: Math.random() * -30,
      scale: 0.5 + Math.random() * 0.4,
      rotation: 0,
      sway: Math.random() * 30 - 15, // Less sway for natural walking
    }))
    setPeople(newPeople)

    // Generate Shooting Stars - FIXED: Now moving from top to bottom diagonally
    const newShootingStars = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 2.5 + Math.random() * 3.5, // 2.5-6 seconds - faster for shooting stars
      delay: Math.random() * -20,
      scale: 0.6 + Math.random() * 0.8,
      rotation: -35 + Math.random() * 15, // Diagonal angle (between -20 to -50 degrees)
      sway: Math.random() * 150 - 75,
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
      dark:from-[#0a0f1a] dark:via-[#0f1a2b] dark:to-[#0b1424]
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
            transform: translateX(-150vw) translateY(0); 
            opacity: 0; 
          }
          10% { 
            opacity: 1; 
          }
          90% { 
            opacity: 1; 
          }
          100% { 
            transform: translateX(150vw) translateY(var(--sway)); 
            opacity: 0; 
          }
        }
        @keyframes shootingStar {
          0% { 
            transform: translateX(-30vw) translateY(-20vh) rotate(var(--rotation)); 
            opacity: 0; 
          }
          20% { 
            opacity: 1; 
          }
          80% { 
            opacity: 1; 
          }
          100% { 
            transform: translateX(70vw) translateY(80vh) rotate(var(--rotation)); 
            opacity: 0; 
          }
        }
        @keyframes waveMotion {
          0% { transform: translateX(0) translateY(0); }
          25% { transform: translateX(-5px) translateY(-2px); }
          50% { transform: translateX(0) translateY(0); }
          75% { transform: translateX(5px) translateY(2px); }
          100% { transform: translateX(0) translateY(0); }
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
          bottom: 5%;
          animation-name: peopleWalk;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          z-index: 0;
          pointer-events: none;
          will-change: transform;
        }
        .shooting-star {
          position: absolute;
          top: 0;
          left: 0;
          animation-name: shootingStar;
          animation-timing-function: cubic-bezier(0.1, 0.2, 0.3, 1);
          animation-iteration-count: infinite;
          z-index: 0;
          pointer-events: none;
          filter: drop-shadow(0 0 15px rgba(255,255,255,0.9));
          will-change: transform;
        }
        .wave {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 60px;
          background: repeating-linear-gradient(
            transparent 0px,
            transparent 25px,
            rgba(255, 255, 255, 0.3) 25px,
            rgba(255, 255, 255, 0.3) 30px
          );
          animation: waveMotion 4s ease-in-out infinite;
          pointer-events: none;
        }
      `}} />

      {/* --- BEACH BACKGROUND LAYER --- */}
      <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-[1]">
        {/* Sky gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-100 to-amber-200 dark:from-[#0a1424] dark:via-[#0f1a2a] dark:to-[#1a2a3a]"></div>
        
        {/* Sun/Moon */}
        <div className="absolute top-20 right-20 w-20 h-20 bg-amber-300 dark:bg-gray-100 rounded-full blur-sm opacity-70 dark:opacity-30"></div>
        
        {/* Ocean */}
        <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-cyan-500/30 to-blue-400/20 dark:from-blue-900/50 dark:to-blue-800/30">
          {/* Wave effect */}
          <div className="wave dark:opacity-30"></div>
        </div>
        
        {/* Sand */}
        <div className="absolute bottom-0 left-0 right-0 h-[15%] bg-gradient-to-t from-amber-300/60 to-amber-200/40 dark:from-amber-900/40 dark:to-amber-800/20"></div>
        
        {/* REALISTIC COCONUT TREES */}
        {/* Left Palm Tree */}
        <div className="absolute bottom-[12%] left-[5%] w-32 h-64 pointer-events-none">
          {/* Trunk */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-48 bg-gradient-to-t from-amber-800 to-amber-700 dark:from-amber-900 dark:to-amber-800 rounded-full"></div>
          {/* Leaves */}
          <div className="absolute bottom-36 left-1/2 -translate-x-1/2">
            <div className="relative w-32 h-32">
              <div className="absolute top-0 left-0 w-16 h-24 bg-green-600 dark:bg-green-900 rounded-full rotate-[-45deg] origin-bottom-right"></div>
              <div className="absolute top-0 right-0 w-16 h-24 bg-green-600 dark:bg-green-900 rounded-full rotate-[45deg] origin-bottom-left"></div>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-14 h-20 bg-green-700 dark:bg-green-950 rounded-full"></div>
              {/* Coconuts */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-6 bg-amber-700 dark:bg-amber-800 rounded-full"></div>
              <div className="absolute bottom-2 left-1/3 w-4 h-5 bg-amber-700 dark:bg-amber-800 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Right Palm Tree */}
        <div className="absolute bottom-[12%] right-[5%] w-32 h-72 pointer-events-none">
          {/* Trunk */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-56 bg-gradient-to-t from-amber-800 to-amber-700 dark:from-amber-900 dark:to-amber-800 rounded-full"></div>
          {/* Leaves */}
          <div className="absolute bottom-44 left-1/2 -translate-x-1/2">
            <div className="relative w-36 h-36">
              <div className="absolute top-0 left-0 w-20 h-28 bg-green-600 dark:bg-green-900 rounded-full rotate-[-50deg] origin-bottom-right"></div>
              <div className="absolute top-0 right-0 w-20 h-28 bg-green-600 dark:bg-green-900 rounded-full rotate-[50deg] origin-bottom-left"></div>
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-16 h-24 bg-green-700 dark:bg-green-950 rounded-full"></div>
              {/* Coconuts */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-6 h-7 bg-amber-700 dark:bg-amber-800 rounded-full"></div>
              <div className="absolute bottom-4 left-1/4 w-5 h-6 bg-amber-700 dark:bg-amber-800 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Small Palm Tree on left */}
        <div className="absolute bottom-[12%] left-[15%] w-20 h-48 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-36 bg-amber-800 dark:bg-amber-900 rounded-full"></div>
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2">
            <div className="relative w-20 h-20">
              <div className="absolute top-0 left-0 w-10 h-14 bg-green-600 dark:bg-green-900 rounded-full rotate-[-40deg]"></div>
              <div className="absolute top-0 right-0 w-10 h-14 bg-green-600 dark:bg-green-900 rounded-full rotate-[40deg]"></div>
            </div>
          </div>
        </div>

        {/* Small Palm Tree on right */}
        <div className="absolute bottom-[12%] right-[15%] w-20 h-48 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-36 bg-amber-800 dark:bg-amber-900 rounded-full"></div>
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2">
            <div className="relative w-20 h-20">
              <div className="absolute top-0 left-0 w-10 h-14 bg-green-600 dark:bg-green-900 rounded-full rotate-[-40deg]"></div>
              <div className="absolute top-0 right-0 w-10 h-14 bg-green-600 dark:bg-green-900 rounded-full rotate-[40deg]"></div>
            </div>
          </div>
        </div>

        {/* FALLING COCONUTS */}
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
                width: `${28 * coconut.scale}px`,
                height: `${32 * coconut.scale}px`,
              }}
            >
              <div className="relative w-full h-full">
                <svg viewBox="0 0 28 32" style={{ width: '100%', height: '100%' }}>
                  <ellipse cx="14" cy="16" rx="11" ry="13" fill="#8B5A2B" className="dark:fill-amber-800" />
                  <ellipse cx="16" cy="14" rx="3" ry="4" fill="#A67B5B" className="dark:fill-amber-700" opacity="0.6" />
                  <path d="M9 9 Q 14 5 19 9" stroke="#5D3A1A" strokeWidth="2" fill="none" />
                  <circle cx="10" cy="18" r="2" fill="#5D3A1A" opacity="0.3" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* PEOPLE WALKING ON BEACH - FIXED: Now at the bottom where sand is */}
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
                width: `${22 * person.scale}px`,
                height: `${38 * person.scale}px`,
              }}
            >
              <svg viewBox="0 0 22 38" style={{ width: '100%', height: '100%' }}>
                {/* Person with beach clothes */}
                <circle cx="11" cy="8" r="6" fill="#2C3E50" className="dark:fill-gray-300" />
                {/* Shirt/Torso */}
                <rect x="7" y="14" width="8" height="14" fill="#34495E" className="dark:fill-gray-400" rx="2" />
                {/* Shorts/Pants */}
                <rect x="7" y="26" width="8" height="8" fill="#2C3E50" className="dark:fill-gray-500" rx="1" />
                {/* Arms - moving */}
                <line x1="7" y1="18" x2="2" y2="22" stroke="#34495E" className="dark:stroke-gray-400" strokeWidth="2.5">
                  <animate attributeName="x2" values="2;4;2" dur="2s" repeatCount="indefinite" />
                </line>
                <line x1="15" y1="18" x2="20" y2="22" stroke="#34495E" className="dark:stroke-gray-400" strokeWidth="2.5">
                  <animate attributeName="x2" values="20;18;20" dur="2s" repeatCount="indefinite" />
                </line>
                {/* Legs - moving */}
                <line x1="9" y1="34" x2="5" y2="38" stroke="#2C3E50" className="dark:stroke-gray-500" strokeWidth="2.5">
                  <animate attributeName="y2" values="38;36;38" dur="1.5s" repeatCount="indefinite" />
                </line>
                <line x1="13" y1="34" x2="17" y2="38" stroke="#2C3E50" className="dark:stroke-gray-500" strokeWidth="2.5">
                  <animate attributeName="y2" values="38;36;38" dur="1.5s" repeatCount="indefinite" />
                </line>
                {/* Beach hat for some */}
                {person.id % 3 === 0 && (
                  <path d="M5 2 L17 2 L15 6 L7 6 Z" fill="#E67E22" className="dark:fill-amber-600" />
                )}
              </svg>
            </div>
          ))}
        </div>

        {/* SHOOTING STARS - FIXED: Now moving from top to bottom correctly */}
        <div className="hidden dark:block w-full h-full">
          {shootingStars.map((star) => (
            <div
              key={`star-${star.id}`}
              className="shooting-star"
              style={{
                left: `${star.left}%`,
                top: `${Math.random() * 30}%`,
                // @ts-ignore
                "--rotation": `${star.rotation}deg`,
                animationDuration: `${star.duration}s`,
                animationDelay: `${star.delay}s`,
              }}
            >
              <svg width="100" height="20" viewBox="0 0 100 20" style={{ filter: 'drop-shadow(0 0 12px white)' }}>
                <defs>
                  <linearGradient id={`starGrad-${star.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="white" stopOpacity="1" />
                    <stop offset="60%" stopColor="white" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 10 L50 7 L85 10 L50 13 L0 10" fill={`url(#starGrad-${star.id})`} />
                <circle cx="80" cy="10" r="6" fill="white" opacity="0.9">
                  <animate attributeName="opacity" values="0.9;0.3;0.9" dur="0.8s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
          ))}
          
          {/* Stars in sky for night mode */}
          {[...Array(50)].map((_, i) => (
            <div
              key={`star-sky-${i}`}
              className="absolute rounded-full bg-white"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 40}%`,
                width: `${1 + Math.random() * 3}px`,
                height: `${1 + Math.random() * 3}px`,
                opacity: 0.2 + Math.random() * 0.5,
                animation: `pulse ${2 + Math.random() * 4}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Seashells on beach */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`shell-${i}`}
            className="absolute bottom-[10%] left-[${10 + i * 10}%] w-4 h-3 bg-amber-200 dark:bg-amber-700 rounded-tl-full rounded-tr-full opacity-40"
            style={{ left: `${10 + i * 10}%` }}
          />
        ))}
      </div>

      {/* Background Glows */}
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
              layout
              initial={{ opacity: 0, height: 0, scale: 0.98 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.98 }}
              transition={{
                duration: 0.4,
                ease: "circOut",
              }}
              className="mt-8 w-full max-w-4xl overflow-hidden"
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
                      active:scale-95"
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
