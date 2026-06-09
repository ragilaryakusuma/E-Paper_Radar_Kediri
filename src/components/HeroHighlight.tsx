'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  Sparkles,
  Heart,
  TrendingUp,
  ChevronRight,
  Newspaper,
} from 'lucide-react'
import type { Paper } from '@/lib/mockData'
import { useAuth } from '@/lib/context/AuthContext'

interface HeroHighlightProps {
  paper: Paper
  hasAccess?: boolean
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 25, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 0.61, 0.36, 1] as const,
    },
  },
}

export default function HeroHighlight({ paper, hasAccess = false }: HeroHighlightProps) {
  const { user } = useAuth()
  const hasUserAccess = hasAccess || user?.isSubscribed || user?.role === 'admin'
  const accessLabel = user?.role === 'admin' 
    ? 'Akses Admin' 
    : (user?.isSubscribed ? 'Akses Langganan' : 'Milik Anda')

  const formattedDate = new Date(paper.date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })



  return (
    <section className="py-8 md:py-12 bg-gradient-to-b from-slate-50/80 via-white to-white relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.015]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23005596' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Container: Same as Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Grid: 12 column system */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">

            {/* ================================== */}
            {/* AREA 1: Main E-Paper Card (8 cols) */}
            {/* ================================== */}
            <motion.div 
              variants={itemVariants}
              className="lg:col-span-12 relative overflow-hidden rounded-2xl lg:rounded-3xl shadow-2xl group"
              style={{ minHeight: '480px' }}
            >
              {/* Deep Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#005596] via-[#004580] to-[#003366]" />
              
              {/* Decorative Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl" />
                <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-yellow-400/[0.08] rounded-full blur-2xl" />
                {/* Subtle grid overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                  backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                  backgroundSize: '50px 50px'
                }} />
              </div>

              {/* Content Container */}
              <div className="relative h-full flex flex-col lg:flex-row items-center p-6 md:p-8 lg:p-10">
                {/* Left: Text Content */}
                <div className="flex-1 z-10">
                  {/* Label Badge */}
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full mb-5">
                    <Newspaper className="w-4 h-4 text-yellow-400" />
                    <span className="text-white/95 text-sm font-semibold tracking-wide">
                      EDISI HARI INI
                    </span>
                  </div>

                  {/* Main Title */}
                  <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-[2.75rem] font-extrabold text-white leading-[1.15] mb-4">
                    {paper.title}
                  </h1>

                  {/* Date */}
                  <p className="text-blue-200/90 font-medium mb-5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    {formattedDate}
                  </p>

                  {/* Description */}
                  <p className="text-blue-100/70 mb-7 max-w-lg text-base leading-relaxed hidden md:block">
                    Akses berita terkini dan terpercaya langsung dari genggaman. 
                    Baca kapan saja, di mana saja dengan kualitas cetak digital.
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/newspapers/${paper.id}`}
                      className="inline-flex items-center gap-2 bg-white hover:bg-yellow-400 text-[#005596] hover:text-[#003366] font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/25 transition-all duration-300 hover:-translate-y-0.5 group/btn"
                    >
                      Baca Sekarang
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Right: 3D Newspaper Cover */}
                <div className="hidden lg:flex flex-shrink-0 ml-8" style={{ perspective: '1000px' }}>
                  <motion.div 
                    className="relative w-48 xl:w-56"
                    style={{ 
                      transformStyle: 'preserve-3d'
                    }}
                    initial={{ rotateY: -8, rotateX: 4 }}
                    whileHover={{ 
                      rotateY: 0, 
                      rotateX: 0, 
                      scale: 1.08,
                      y: -10,
                      transition: { 
                        type: 'spring', 
                        stiffness: 300, 
                        damping: 20 
                      }
                    }}
                    animate={{ 
                      y: [0, -6, 0],
                      transition: {
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }
                    }}
                  >
                    {/* Shadow underneath */}
                    <motion.div 
                      className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[85%] h-8 bg-black/30 blur-xl rounded-full"
                      whileHover={{ 
                        scale: 1.2, 
                        opacity: 0.5,
                        transition: { duration: 0.3 }
                      }}
                    />
                    
                    {/* Cover Image */}
                    <div className="relative rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10">
                      <Image
                        src={paper.coverUrl}
                        alt={paper.title}
                        width={224}
                        height={320}
                        className="w-full h-auto object-cover"
                        priority
                      />
                      
                      {/* Continuous Shimmer Effect */}
                      <motion.div 
                        className="absolute inset-0 pointer-events-none"
                        initial={{ x: '-100%' }}
                        animate={{ 
                          x: '200%',
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          repeatDelay: 2,
                          ease: 'easeInOut'
                        }}
                      >
                        <div 
                          className="w-1/2 h-full"
                          style={{
                            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0) 20%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 80%, transparent 100%)',
                            transform: 'skewX(-20deg)',
                          }}
                        />
                      </motion.div>

                      {/* Hover Shine Effect */}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"
                        style={{ transform: 'skewX(-20deg)' }}
                        initial={{ x: '-150%', opacity: 0 }}
                        whileHover={{ 
                          x: '150%',
                          opacity: 1,
                          transition: { duration: 0.7, ease: 'easeOut' }
                        }}
                      />
                    </div>

                    {/* Price Tag */}
                    <motion.div 
                      className="absolute -bottom-2 -right-2 bg-yellow-400 text-[#003366] font-bold text-sm px-3 py-1.5 rounded-lg shadow-lg"
                      initial={{ rotate: 3 }}
                      whileHover={{ 
                        rotate: -3, 
                        scale: 1.1,
                        transition: { type: 'spring', stiffness: 400 }
                      }}
                    >
                      {hasUserAccess ? accessLabel : `Rp ${paper.price.toLocaleString('id-ID')}`}
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.div>





          </div>
        </motion.div>
      </div>
    </section>
  )
}
