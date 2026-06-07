'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Library, LogIn, BookOpen, Newspaper, Download, Eye, Clock } from 'lucide-react'
import { getAllPapers } from '@/lib/mockData'
import { useAuth } from '@/lib/context/AuthContext'

export default function LibraryPage() {
  const { user, setUser, logout } = useAuth()
  const isLoggedIn = !!user
  
  // Simulasi data koleksi user (koran yang sudah dibeli)
  const papers = getAllPapers()
  const purchasedPapers = papers.slice(0, 4) // Ambil 4 koran sebagai contoh

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  // Tampilan jika belum login
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-32 lg:pt-40 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-3xl mb-6">
              <Library className="w-12 h-12 text-primary" />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Koleksi Saya
            </h1>
            <p className="text-gray-600 mb-8">
              Login untuk mengakses semua koran dan buku digital yang telah Anda beli. 
              Baca kapan saja, di mana saja.
            </p>

            {/* Login Button */}
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              <LogIn className="w-5 h-5" />
              Login untuk Melihat Koleksi
            </Link>

            {/* Demo Button (untuk testing) */}
            <button
              onClick={() => {
                const demoUser = {
                  id: 'demo-user-id',
                  email: 'demo@radarkediri.id',
                  name: 'Demo User',
                  isSubscribed: false,
                }
                setUser(demoUser)
                localStorage.setItem('user', JSON.stringify(demoUser))
              }}
              className="block w-full mt-4 text-gray-500 hover:text-primary text-sm underline"
            >
              Demo: Simulasi sudah login
            </button>

            {/* Features */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <Download className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-semibold text-gray-900">Akses Offline</h3>
                <p className="text-sm text-gray-500">Download dan baca tanpa internet</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <Clock className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-semibold text-gray-900">Akses Seumur Hidup</h3>
                <p className="text-sm text-gray-500">Beli sekali, baca selamanya</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <BookOpen className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-semibold text-gray-900">Multi Device</h3>
                <p className="text-sm text-gray-500">Sinkron di semua perangkat</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Tampilan jika sudah login
  return (
    <main className="min-h-screen bg-gray-50 pt-32 lg:pt-40 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Koleksi Saya
            </h1>
            <p className="text-gray-600">
              {purchasedPapers.length} item dalam koleksi Anda
            </p>
          </div>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-red-500"
          >
            Demo: Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button className="flex items-center gap-2 bg-primary text-white font-medium px-4 py-2.5 rounded-xl">
            <Newspaper className="w-4 h-4" />
            Koran ({purchasedPapers.length})
          </button>
          <button className="flex items-center gap-2 bg-white text-gray-700 hover:bg-gray-100 font-medium px-4 py-2.5 rounded-xl border border-gray-200">
            <BookOpen className="w-4 h-4" />
            Buku (0)
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {purchasedPapers.map((paper) => (
            <div 
              key={paper.id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
            >
              {/* Cover */}
              <div className="aspect-[3/4] relative bg-gray-100 overflow-hidden">
                <Image
                  src={paper.coverUrl}
                  alt={paper.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
                {/* Purchased Badge */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    ✓ Dibeli
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 line-clamp-1 mb-1">
                  {paper.title}
                </h3>
                <p className="text-gray-500 text-sm mb-3">{formatDate(paper.date)}</p>
                
                <Link
                  href={`/newspapers/${paper.id}`}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-700 text-white font-medium py-2.5 rounded-xl transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Baca
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (jika tidak ada koleksi) */}
        {purchasedPapers.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Library className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Koleksi kosong</h3>
            <p className="text-gray-500 mb-6">Anda belum memiliki koran atau buku digital</p>
            <Link
              href="/newspapers"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
            >
              Jelajahi Koran
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
