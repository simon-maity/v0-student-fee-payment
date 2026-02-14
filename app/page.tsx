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
  color?: string // Color class
  rotation: number // Initial rotation
  sway: number // Random horizontal sway
  top?: number // Starting position
}

interface Coconut {
  id: number
  left: number
  top: number
  scale: number
  rotation: number
}

interface Person {
  id: number
  left: number
  duration: number
  delay: number
  scale: number
  direction: number // 1 for right, -1 for left
}

interface Star {
  id: number
  left: number
  top: number
  duration: number
  delay: number
  size: number
  rotation: number
}

export default function HomePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // --- BEACH STATE ---
  const [clouds, setClouds] = useState<BeachItem[]>([])
  const [seagulls, setSeagulls] = useState<BeachItem[]>([])
  const [coconuts, setCoconuts] = useState<Coconut[]>([])
  const [palmTrees, setPalmTrees] = useState<BeachItem[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [stars, setStars] = useState<Star[]>([])
  const [waves, setWaves] = useState<BeachItem[]>([])

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
    
    // Clouds (for day mode)
    const cloudColors = ["text-white/90", "text-white/80", "text-white/70", "text-white/60"];
    const newClouds = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 60 + Math.random() * 40,
      delay: Math.random() * -30,
      scale: 0.8 + Math.random() * 0.8,
      color: cloudColors[Math.floor(Math.random() * cloudColors.length)],
      rotation: 0,
      sway: Math.random() * 40 - 20,
      top: Math.random() * 40,
    }))
    setClouds(newClouds)

    // Seagulls
    const newSeagulls = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 25 + Math.random() * 20,
      delay: Math.random() * -15,
      scale: 0.5 + Math.random() * 0.4,
      color: "text-white",
      rotation: Math.random() * 20 - 10,
      sway: Math.random() * 100 - 50,
    }))
    setSeagulls(newSeagulls)

    // Palm Trees (static background)
    const newPalmTrees = Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      left: 5 + Math.random() * 90,
      duration: 0,
      delay: 0,
      scale: 0.7 + Math.random() * 0.5,
      color: i % 2 === 0 ? "text-emerald-700" : "text-emerald-800",
      rotation: Math.random() * 10 - 5,
      sway: 0,
    }))
    setPalmTrees(newPalmTrees)

    // Coconuts (on ground)
    const newCoconuts = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: 70 + Math.random() * 25,
      scale: 0.3 + Math.random() * 0.3,
      rotation: Math.random() * 360,
    }))
    setCoconuts(newCoconuts)

    // Waves (gentle moving waves)
    const newWaves = Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 8 + Math.random() * 5,
      delay: Math.random() * -5,
      scale: 1 + Math.random() * 0.5,
      color: `text-cyan-${300 + i * 100}/40`,
      rotation: 0,
      sway: Math.random() * 30 - 15,
    }))
    setWaves(newWaves)

    // People walking on beach (for day mode)
    const newPeople = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 40 + Math.random() * 30,
      delay: Math.random() * -20,
      scale: 0.5 + Math.random() * 0.3,
      direction: Math.random() > 0.5 ? 1 : -1,
    }))
    setPeople(newPeople)

    // Shooting stars (for night mode)
    const newStars = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 60,
      duration: 8 + Math.random() * 6,
      delay: Math.random() * -10,
      size: 2 + Math.random() * 3,
      rotation: 45 + Math.random() * 30,
    }))
    setStars(newStars)

  }, [])

  if (!mounted)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-sky-200 to-amber-100 dark:from-indigo-950 dark:to-purple-950">
        <div className="w-10 h-10 border-4 border-amber-400/30 border-t-amber-600 rounded-full animate-spin" />
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
      bg-gradient-to-b from-sky-200 via-amber-100 to-emerald-200
      dark:from-indigo-950 dark:via-purple-950 dark:to-blue-950
      text-gray-900 dark:text-white transition-all duration-300 overflow-x-hidden"
    >
      {/* --- INLINE STYLES FOR BEACH ANIMATION --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatClouds {
          0% { transform: translateX(-10vw) translateY(0) rotate(0deg); opacity: 0.8; }
          50% { transform: translateX(10vw) translateY(-20px) rotate(1deg); opacity: 1; }
          100% { transform: translateX(30vw) translateY(0) rotate(0deg); opacity: 0.8; }
        }
        
        @keyframes flySeagulls {
          0% { transform: translateX(-20vw) translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          50% { transform: translateX(10vw) translateY(-30px) rotate(5deg); }
          90% { opacity: 1; }
          100% { transform: translateX(40vw) translateY(0) rotate(0deg); opacity: 0; }
        }
        
        @keyframes walkPeople {
          0% { transform: translateX(-10vw) translateY(0) scaleX(1); opacity: 0; }
          10% { opacity: 1; }
          50% { transform: translateX(10vw) translateY(-5px) scaleX(1); }
          90% { opacity: 1; }
          100% { transform: translateX(30vw) translateY(0) scaleX(1); opacity: 0; }
        }
        
        @keyframes walkPeopleReverse {
          0% { transform: translateX(10vw) translateY(0) scaleX(-1); opacity: 0; }
          10% { opacity: 1; }
          50% { transform: translateX(-10vw) translateY(-5px) scaleX(-1); }
          90% { opacity: 1; }
          100% { transform: translateX(-30vw) translateY(0) scaleX(-1); opacity: 0; }
        }
        
        @keyframes shootingStar {
          0% { transform: translate(0, 0) rotate(45deg) scale(1); opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translate(100px, 100px) rotate(45deg) scale(0.1); opacity: 0; }
        }
        
        @keyframes waveMove {
          0% { transform: translateX(-10px) translateY(0); opacity: 0.4; }
          50% { transform: translateX(10px) translateY(5px); opacity: 0.6; }
          100% { transform: translateX(-10px) translateY(0); opacity: 0.4; }
        }
        
        @keyframes twinkle {
          0% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0.2; transform: scale(1); }
        }
        
        .beach-cloud {
          position: absolute;
          top: 5%;
          animation: floatClouds linear infinite;
          z-index: 0;
          pointer-events: none;
          will-change: transform;
        }
        
        .beach-seagull {
          position: absolute;
          top: 10%;
          animation: flySeagulls linear infinite;
          z-index: 1;
          pointer-events: none;
          will-change: transform;
        }
        
        .beach-person {
          position: absolute;
          bottom: 20%;
          animation: var(--walk-direction) linear infinite;
          z-index: 2;
          pointer-events: none;
          will-change: transform;
        }
        
        .shooting-star {
          position: absolute;
          animation: shootingStar linear infinite;
          z-index: 3;
          pointer-events: none;
          will-change: transform;
        }
        
        .twinkling-star {
          position: absolute;
          animation: twinkle ease-in-out infinite;
          z-index: 2;
          pointer-events: none;
          will-change: opacity, transform;
        }
        
        .beach-wave {
          position: absolute;
          bottom: 15%;
          animation: waveMove ease-in-out infinite;
          z-index: 1;
          pointer-events: none;
          will-change: transform;
        }
      `}} />

      {/* --- BEACH BACKGROUND LAYER (FIXED) --- */}
      <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-[1]">
        {/* Ocean gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-300/30 via-transparent to-transparent dark:from-blue-900/50 dark:via-transparent dark:to-transparent"></div>
        
        {/* Sand (bottom) */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-amber-200 to-transparent dark:from-amber-900/50 dark:to-transparent"></div>
        
        {/* Sun/Moon */}
        <div className="absolute top-20 right-20 w-24 h-24 bg-yellow-300 rounded-full blur-3xl opacity-30 dark:hidden"></div>
        <div className="absolute top-20 right-20 w-20 h-20 bg-white rounded-full blur-2xl opacity-20 hidden dark:block"></div>
        
        {/* DAY MODE ELEMENTS */}
        <div className="block dark:hidden w-full h-full">
          {/* Clouds */}
          {clouds.map((cloud) => (
            <div
              key={`cloud-${cloud.id}`}
              className={`beach-cloud ${cloud.color}`}
              style={{
                left: `${cloud.left}%`,
                top: `${cloud.top}%`,
                animationDuration: `${cloud.duration}s`,
                animationDelay: `${cloud.delay}s`,
                width: `${100 * cloud.scale}px`,
                height: `${50 * cloud.scale}px`,
              }}
            >
              <svg viewBox="0 0 100 50" fill="currentColor" style={{ filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.1))' }}>
                <circle cx="30" cy="25" r="20" />
                <circle cx="50" cy="20" r="25" />
                <circle cx="70" cy="25" r="20" />
                <circle cx="20" cy="30" r="15" />
                <circle cx="80" cy="30" r="15" />
              </svg>
            </div>
          ))}

          {/* Seagulls */}
          {seagulls.map((gull) => (
            <div
              key={`gull-${gull.id}`}
              className="beach-seagull text-white"
              style={{
                left: `${gull.left}%`,
                animationDuration: `${gull.duration}s`,
                animationDelay: `${gull.delay}s`,
                width: `${40 * gull.scale}px`,
                height: `${30 * gull.scale}px`,
              }}
            >
              <svg viewBox="0 0 40 30" fill="currentColor" stroke="#000" strokeWidth="0.5">
                <path d="M5 15 Q 15 5 25 15 Q 35 25 25 20 Q 15 15 5 15" />
                <path d="M15 15 L 10 8 M25 15 L 30 8" stroke="currentColor" strokeWidth="1" fill="none" />
              </svg>
            </div>
          ))}

          {/* People walking */}
          {people.map((person) => (
            <div
              key={`person-${person.id}`}
              className="beach-person"
              style={{
                left: `${person.left}%`,
                // @ts-ignore
                '--walk-direction': person.direction === 1 ? 'walkPeople' : 'walkPeopleReverse',
                animationDuration: `${person.duration}s`,
                animationDelay: `${person.delay}s`,
                width: `${30 * person.scale}px`,
                height: `${50 * person.scale}px`,
              }}
            >
              <svg viewBox="0 0 30 50" fill="none" stroke="currentColor" className="text-gray-700 dark:text-gray-300">
                <circle cx="15" cy="10" r="5" fill="currentColor" />
                <rect x="12" y="15" width="6" height="20" fill="currentColor" />
                <line x1="8" y1="25" x2="12" y2="35" stroke="currentColor" strokeWidth="2" />
                <line x1="22" y1="25" x2="18" y2="35" stroke="currentColor" strokeWidth="2" />
                <line x1="12" y1="35" x2="8" y2="45" stroke="currentColor" strokeWidth="2" />
                <line x1="18" y1="35" x2="22" y2="45" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          ))}

          {/* Waves */}
          {waves.map((wave) => (
            <div
              key={`wave-${wave.id}`}
              className="beach-wave text-cyan-400/40"
              style={{
                left: `${wave.left}%`,
                bottom: '15%',
                animationDuration: `${wave.duration}s`,
                animationDelay: `${wave.delay}s`,
                width: `${80 * wave.scale}px`,
                height: `${20 * wave.scale}px`,
              }}
            >
              <svg viewBox="0 0 80 20" fill="currentColor">
                <path d="M0 10 Q 20 0 40 10 Q 60 20 80 10" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M0 15 Q 20 5 40 15 Q 60 25 80 15" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
              </svg>
            </div>
          ))}
        </div>

        {/* NIGHT MODE ELEMENTS */}
        <div className="hidden dark:block w-full h-full">
          {/* Stars background */}
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <div
                key={`static-star-${i}`}
                className="twinkling-star bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 60}%`,
                  width: `${Math.random() * 3}px`,
                  height: `${Math.random() * 3}px`,
                  animationDuration: `${3 + Math.random() * 5}s`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              />
            ))}
          </div>

          {/* Shooting Stars */}
          {stars.map((star) => (
            <div
              key={`shooting-${star.id}`}
              className="shooting-star"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                animationDuration: `${star.duration}s`,
                animationDelay: `${star.delay}s`,
                width: `${star.size * 3}px`,
                height: `${star.size}px`,
                background: 'linear-gradient(45deg, white, transparent)',
                transform: `rotate(${star.rotation}deg)`,
                filter: 'blur(1px)',
                boxShadow: '0 0 10px white',
              }}
            />
          ))}

          {/* Bioluminescent waves (night) */}
          {waves.map((wave) => (
            <div
              key={`night-wave-${wave.id}`}
              className="beach-wave text-cyan-300/30"
              style={{
                left: `${wave.left}%`,
                bottom: '15%',
                animationDuration: `${wave.duration}s`,
                animationDelay: `${wave.delay}s`,
                width: `${100 * wave.scale}px`,
                height: `${30 * wave.scale}px`,
                filter: 'drop-shadow(0 0 5px cyan)',
              }}
            >
              <svg viewBox="0 0 100 30" fill="none">
                <path d="M0 15 Q 25 5 50 15 Q 75 25 100 15" stroke="#00ffff" strokeWidth="1" fill="none" opacity="0.3" />
                <circle cx="20" cy="12" r="2" fill="#00ffff" opacity="0.2" />
                <circle cx="50" cy="18" r="3" fill="#00ffff" opacity="0.2" />
                <circle cx="80" cy="14" r="2" fill="#00ffff" opacity="0.2" />
              </svg>
            </div>
          ))}

          {/* Night time people (with glow) */}
          {people.slice(0, 8).map((person) => (
            <div
              key={`night-person-${person.id}`}
              className="beach-person"
              style={{
                left: `${person.left}%`,
                // @ts-ignore
                '--walk-direction': person.direction === 1 ? 'walkPeople' : 'walkPeopleReverse',
                animationDuration: `${person.duration}s`,
                animationDelay: `${person.delay}s`,
                width: `${30 * person.scale}px`,
                height: `${50 * person.scale}px`,
                filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.3))',
              }}
            >
              <svg viewBox="0 0 30 50" fill="none" stroke="white" className="text-gray-200">
                <circle cx="15" cy="10" r="5" fill="currentColor" />
                <rect x="12" y="15" width="6" height="20" fill="currentColor" />
                <line x1="8" y1="25" x2="12" y2="35" stroke="currentColor" strokeWidth="2" />
                <line x1="22" y1="25" x2="18" y2="35" stroke="currentColor" strokeWidth="2" />
                <line x1="12" y1="35" x2="8" y2="45" stroke="currentColor" strokeWidth="2" />
                <line x1="18" y1="35" x2="22" y2="45" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          ))}
        </div>

        {/* Palm Trees (both modes) */}
        {palmTrees.map((tree) => (
          <div
            key={`palm-${tree.id}`}
            className="absolute bottom-[15%] z-[2]"
            style={{
              left: `${tree.left}%`,
              transform: `scale(${tree.scale}) rotate(${tree.rotation}deg)`,
              width: '60px',
              height: '120px',
            }}
          >
            <svg viewBox="0 0 60 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="25" y="40" width="10" height="70" fill="#8B4513" rx="3" />
              <path d="M30 40 L10 20 L20 30 L30 15 L40 30 L50 20 L30 40" fill="#2E7D32" />
              <path d="M30 35 L5 10 L15 18 L30 5 L45 18 L55 10 L30 35" fill="#4CAF50" />
              <circle cx="30" cy="50" r="5" fill="#5D4037" />
            </svg>
          </div>
        ))}

        {/* Coconuts */}
        {coconuts.map((coconut) => (
          <div
            key={`coconut-${coconut.id}`}
            className="absolute z-[3]"
            style={{
              left: `${coconut.left}%`,
              top: `${coconut.top}%`,
              transform: `scale(${coconut.scale}) rotate(${coconut.rotation}deg)`,
              width: '20px',
              height: '20px',
            }}
          >
            <svg viewBox="0 0 20 20" fill="#8B4513">
              <circle cx="10" cy="10" r="8" fill="#8B4513" />
              <circle cx="7" cy="7" r="2" fill="#5D4037" />
              <circle cx="13" cy="13" r="2" fill="#5D4037" />
              <circle cx="10" cy="10" r="3" fill="#A0522D" />
            </svg>
          </div>
        ))}
      </div>

      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none z-[2]">
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-amber-500/20 blur-[100px] rounded-full animate-pulse dark:bg-indigo-500/20"></div>
        <div className="absolute bottom-1/4 right-10 w-64 h-64 bg-cyan-500/20 blur-[100px] rounded-full animate-pulse dark:bg-purple-500/20"></div>
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
        className="relative z-10 py-16 sm:py-20 bg-white/80 dark:bg-[#0f0f1a]/80 backdrop-blur-sm px-4 sm:px-6"
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
        className="relative z-10 py-16 sm:py-20 px-4 md:px-20 bg-gray-50/80 dark:bg-[#0f0f1a]/80 backdrop-blur-sm"
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
        className="relative z-10 py-16 sm:py-20 px-4 md:px-20 bg-white/80 dark:bg-[#11111f]/80 backdrop-blur-sm"
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
        className="relative z-10 py-16 sm:py-20 px-4 md:px-20 bg-gray-50/80 dark:bg-[#0f0f1a]/80 backdrop-blur-sm"
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
