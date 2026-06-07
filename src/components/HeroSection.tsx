'use client'

import Image from 'next/image'
import Link from 'next/link'
import { BookOpen, Calendar, ArrowRight } from 'lucide-react'

interface HeroSectionProps {
  badge?: string
  headline: string
  description: string
  coverImage: string
  editionDate: string
  editionId: string
}

export default function HeroSection({
  badge = 'EDISI HARI INI',
  headline,
  description,
  coverImage,
  editionDate,
  editionId,
}: HeroSectionProps) {
  const formattedDate = new Date(editionDate).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <section className="bg-gradient-to-b from-white to-paper-bg overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Left - Text Content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              {badge}
            </span>

            {/* Date */}
            <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-500 mb-4">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{formattedDate}</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
              {headline}
            </h1>

            {/* Description */}
            <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0">
              {description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href={`/newspapers/${editionId}`}
                className="group inline-flex items-center gap-2 bg-primary hover:bg-primary-600 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:shadow-xl hover:shadow-primary/25 hover:scale-105"
              >
                <BookOpen className="w-5 h-5" />
                <span>Baca Edisi Ini</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/newspapers"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-primary font-medium px-6 py-4 rounded-full transition-colors"
              >
                <span>Lihat Semua Edisi</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-10 pt-8 border-t border-gray-200 flex items-center justify-center lg:justify-start gap-8">
              <div className="text-center lg:text-left">
                <p className="text-2xl font-bold text-gray-900">24</p>
                <p className="text-sm text-gray-500">Halaman</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center lg:text-left">
                <p className="text-2xl font-bold text-gray-900">15+</p>
                <p className="text-sm text-gray-500">Berita Utama</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center lg:text-left">
                <p className="text-2xl font-bold text-primary">Rp 10.000</p>
                <p className="text-sm text-gray-500">Per Edisi</p>
              </div>
            </div>
          </div>

          {/* Right - Newspaper Cover Visual */}
          <div className="flex-shrink-0 relative">
            {/* Background decorations */}
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl blur-2xl" />
            
            {/* Secondary newspaper (behind) */}
            <div className="absolute top-8 -left-6 w-56 md:w-64 lg:w-72 opacity-40">
              <div className="aspect-[3/4] bg-gray-200 rounded-lg rotate-[-8deg] shadow-lg" />
            </div>

            {/* Main newspaper cover */}
            <div className="relative z-10 w-64 md:w-72 lg:w-80">
              <div 
                className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500 ease-out"
                style={{
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                }}
              >
                {/* Paper texture overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent z-10 pointer-events-none" />
                
                {/* Cover image */}
                <Image
                  src={coverImage}
                  alt={`Cover ${headline}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 256px, (max-width: 1024px) 288px, 320px"
                  priority
                />

                {/* Newspaper header overlay */}
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-primary via-primary/90 to-transparent p-4 z-20">
                  <p className="text-white font-bold text-lg tracking-wide text-center">
                    RADAR KEDIRI
                  </p>
                  <p className="text-white/80 text-xs text-center">
                    {formattedDate}
                  </p>
                </div>

                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 z-30 pointer-events-none" />
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 z-20">
                <div className="bg-secondary text-white font-bold px-4 py-2 rounded-full shadow-lg text-sm animate-pulse">
                  🔥 Terbaru
                </div>
              </div>
            </div>

            {/* Decorative dots */}
            <div className="absolute -bottom-8 left-0 grid grid-cols-4 gap-2">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary/20"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="h-16 bg-paper-bg relative -mt-1">
        <svg
          className="absolute bottom-full w-full h-8 text-paper-bg"
          preserveAspectRatio="none"
          viewBox="0 0 1440 48"
          fill="currentColor"
        >
          <path d="M0,48 L60,42 C120,36,240,24,360,18 C480,12,600,12,720,18 C840,24,960,36,1080,39 C1200,42,1320,36,1380,33 L1440,30 L1440,48 L0,48 Z" />
        </svg>
      </div>
    </section>
  )
}
