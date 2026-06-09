'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Library, LogIn, BookOpen, Newspaper, Download, Eye, Clock } from 'lucide-react'
import { useAuth } from '@/lib/context/AuthContext'
import { supabase } from '@/lib/supabase'

export default function LibraryPage() {
  const { user, setUser, logout } = useAuth()
  const isLoggedIn = !!user
  
  const [activeTab, setActiveTab] = useState<'koran' | 'buku'>('koran')
  const [newspapers, setNewspapers] = useState<any[]>([])
  const [books, setBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      fetchLibrary()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, user?.id])

  const fetchLibrary = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || (user?.id === 'demo-user-id' ? 'mock-demo-token' : undefined)

      const response = await fetch(`/api/library?userId=${user?.id}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      })

      if (response.ok) {
        const data = await response.json()
        setNewspapers(data.newspapers || [])
        setBooks(data.books || [])
      } else {
        console.error('Failed to fetch library')
      }
    } catch (e) {
      console.error('Error fetching library:', e)
    } finally {
      setLoading(false)
    }
  }

  // Tampilan jika belum login
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-32 lg:pt-40 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-3xl mb-6">
              <Library className="w-12 h-12 text-[#006CB9]" />
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
              className="inline-flex items-center gap-2 bg-[#006CB9] hover:bg-[#005596] text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
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
                <Download className="w-8 h-8 text-[#006CB9] mb-2" />
                <h3 className="font-semibold text-gray-900">Akses Offline</h3>
                <p className="text-sm text-gray-500">Download dan baca tanpa internet</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <Clock className="w-8 h-8 text-[#006CB9] mb-2" />
                <h3 className="font-semibold text-gray-900">Akses Seumur Hidup</h3>
                <p className="text-sm text-gray-500">Beli sekali, baca selamanya</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <BookOpen className="w-8 h-8 text-[#006CB9] mb-2" />
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
              {activeTab === 'koran' ? newspapers.length : books.length} item dalam koleksi Anda
            </p>
          </div>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-red-500 border border-gray-200 bg-white px-3 py-1.5 rounded-lg"
          >
            Demo: Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8">
          <button 
            onClick={() => setActiveTab('koran')}
            className={`flex items-center gap-2 font-semibold px-5 py-3 rounded-2xl border transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm ${
              activeTab === 'koran' 
                ? 'bg-[#006CB9] text-white border-transparent shadow-md shadow-blue-500/10' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            Koran ({newspapers.length})
          </button>
          <button 
            onClick={() => setActiveTab('buku')}
            className={`flex items-center gap-2 font-semibold px-5 py-3 rounded-2xl border transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm ${
              activeTab === 'buku' 
                ? 'bg-amber-600 text-white border-transparent shadow-md shadow-amber-600/10' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Buku ({books.length})
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006CB9] mx-auto mb-4"></div>
            <p className="text-gray-500">Memuat koleksi Anda...</p>
          </div>
        ) : (
          <>
            {/* Koran Grid */}
            {activeTab === 'koran' && newspapers.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {newspapers.map((paper) => (
                  <div 
                    key={paper.id}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                  >
                    {/* Cover */}
                    <div className="aspect-[3/4] relative bg-gray-100 overflow-hidden">
                      <Image
                        src={paper.coverImageUrl || paper.coverUrl || '/newspapers/cover1.jpg'}
                        alt={paper.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                      {/* Purchased Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          ✓ Akses
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 line-clamp-1 mb-1">
                        {paper.title}
                      </h3>
                      <p className="text-gray-500 text-sm mb-3">
                        {new Date(paper.publishDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      
                      <Link
                        href={`/newspapers/${paper.id}`}
                        className="w-full flex items-center justify-center gap-2 bg-[#006CB9] hover:bg-[#005596] text-white font-medium py-2.5 rounded-xl transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Baca
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Buku Grid */}
            {activeTab === 'buku' && books.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {books.map((book) => (
                  <div 
                    key={book.id}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                  >
                    {/* Cover */}
                    <div className="aspect-[3/4] relative bg-gray-100 overflow-hidden">
                      <Image
                        src={book.coverUrl || '/books/cover.jpg'}
                        alt={book.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                      {/* Purchased Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          ✓ Dimiliki
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 line-clamp-1 mb-1">
                        {book.title}
                      </h3>
                      <p className="text-gray-500 text-sm mb-3">{book.author}</p>
                      
                      <Link
                        href={`/books/${book.id}`}
                        className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 rounded-xl transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Baca Buku
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {((activeTab === 'koran' && newspapers.length === 0) || (activeTab === 'buku' && books.length === 0)) && (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Library className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Koleksi Kosong</h3>
                <p className="text-gray-500 mb-6">
                  {activeTab === 'koran' 
                    ? 'Anda belum memiliki akses koran digital.' 
                    : 'Anda belum memiliki koleksi buku digital.'}
                </p>
                <Link
                  href={activeTab === 'koran' ? '/newspapers' : '/books'}
                  className={`inline-flex items-center gap-2 text-white font-medium px-6 py-3 rounded-xl transition-colors ${
                    activeTab === 'koran' ? 'bg-[#006CB9] hover:bg-[#005596]' : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {activeTab === 'koran' ? 'Jelajahi E-Paper' : 'Jelajahi Buku'}
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
