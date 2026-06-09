'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  ChevronRight,
  Maximize2,
  Share2,
  Calendar,
  FileText,
  ShoppingCart,
  User as UserIcon,
  Tag,
  BookOpen
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface Book {
  id: string
  title: string
  author: string
  publishDate: string
  coverUrl: string
  pdfUrl: string
  price: number | string
  category: string
  description?: string | null
}

export default function BookDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [otherBooks, setOtherBooks] = useState<Book[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showPdf, setShowPdf] = useState(false)
  const [pdfAccessUrl, setPdfAccessUrl] = useState<string | null>(null)
  const [accessError, setAccessError] = useState<string | null>(null)
  const [checkingAccess, setCheckingAccess] = useState(false)

  // Pembelian ditiadakan karena buku gratis untuk dibaca digital dan kontak WhatsApp untuk cetak.

  const handleReadNow = async () => {
    if (!book) return
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      alert('Silakan login terlebih dahulu untuk membaca buku.')
      window.location.href = `/auth/login?redirect=/books/${params.id}`
      return
    }

    const userObj = JSON.parse(storedUser)

    // Jika demo user, bypass request server
    if (userObj.id === 'demo-user-id') {
      setPdfAccessUrl(book.pdfUrl)
      setShowPdf(true)
      return
    }

    setCheckingAccess(true)
    setAccessError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const response = await fetch('/api/reader/access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ bookId: book.id })
      })

      const result = await response.json()

      if (response.ok && result.url) {
        setPdfAccessUrl(result.url)
        setShowPdf(true)
      } else {
        setAccessError(result.error || 'Akses ditolak. Silakan login terlebih dahulu.')
      }
    } catch (error) {
      console.error('Error verifying access:', error)
      setAccessError('Gagal memverifikasi akses. Silakan coba lagi.')
    } finally {
      setCheckingAccess(false)
    }
  }

  useEffect(() => {
    fetchBook()
    fetchOtherBooks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const fetchBook = async () => {
    try {
      const response = await fetch(`/api/books/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setBook(data)
      }
    } catch (error) {
      console.error('Failed to fetch book:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOtherBooks = async () => {
    try {
      const response = await fetch('/api/books')
      if (response.ok) {
        const data = await response.json()
        // Filter out current book
        setOtherBooks(data.filter((b: Book) => b.id !== params.id).slice(0, 4))
      }
    } catch (error) {
      console.error('Failed to fetch other books:', error)
    }
  }

  // Disable right click inside pdf reader to prevent printing/saving easily
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (showPdf) {
        e.preventDefault()
        toast.error('Fitur Klik Kanan Dinonaktifkan untuk Melindungi Dokumen')
      }
    }
    window.addEventListener('contextmenu', handleContextMenu)
    return () => window.removeEventListener('contextmenu', handleContextMenu)
  }, [showPdf])

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 pt-32 lg:pt-40 pb-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </main>
    )
  }

  if (!book) {
    return (
      <main className="min-h-screen bg-gray-50 pt-32 lg:pt-40 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Buku tidak ditemukan</h1>
          <Link href="/books" className="text-amber-600 hover:underline">
            Kembali ke Daftar Buku
          </Link>
        </div>
      </main>
    )
  }

  const formattedDate = new Date(book.publishDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(book.price))

  // Fullscreen PDF viewer (Strictly Read-only, No Download)
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-gray-900 select-none">
        {/* Fullscreen toolbar */}
        <div className="absolute top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFullscreen(false)}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-white font-medium">[Buku Proteksi] {book.title}</span>
          </div>
          <button
            onClick={() => setIsFullscreen(false)}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            Tutup (Esc)
          </button>
        </div>

        {/* PDF iframe fullscreen - toolbar hidden */}
        <iframe
          src={`${pdfAccessUrl || book.pdfUrl}#toolbar=0&navpanes=0&messages=0`}
          className="w-full h-full pt-14"
          title={`${book.title} - Read Only`}
        />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-28 lg:pt-36 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-amber-600 transition-colors">Beranda</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/books" className="hover:text-amber-600 transition-colors">Buku Digital</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">{book.title}</span>
        </nav>

        {!showPdf ? (
          /* ============ DETAIL VIEW ============ */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Cover & Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden sticky top-36">
                {/* Cover Image */}
                <div className="aspect-[3/4] relative bg-gray-100">
                  <Image
                    src={book.coverUrl || '/books/cover.jpg'}
                    alt={`Cover ${book.title}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    priority
                  />
                </div>

                {/* Info */}
                <div className="p-5 space-y-4">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 mb-1">{book.title}</h1>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <UserIcon className="w-4 h-4" />
                      <span>{book.author}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Terbit: {formattedDate}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Tag className="w-4 h-4 text-amber-600" />
                    <span className="bg-amber-50 text-amber-800 text-xs px-2.5 py-1 rounded-full font-semibold">
                      {book.category}
                    </span>
                  </div>

                  {/* Info Koleksi */}
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <p className="text-sm font-semibold text-amber-800 mb-1">Koleksi Digital Radar Kediri</p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Buku digital ini tersedia gratis untuk dibaca di platform bagi pengguna yang terdaftar.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  {accessError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl mb-4 text-center">
                      <p className="font-semibold">{accessError}</p>
                    </div>
                  )}

                  <button
                    onClick={handleReadNow}
                    disabled={checkingAccess}
                    className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-bold py-3.5 px-6 rounded-xl transition-all hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    {checkingAccess ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Memproses Akses...
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-5 h-5" />
                        Baca Sekarang (Proteksi PDF)
                      </>
                    )}
                  </button>

                  <div className="flex flex-col gap-2">
                    <a 
                      href={`https://wa.me/628123456789?text=Halo%20Radar%20Kediri,%20saya%20tertarik%20dengan%20buku%20berjudul%20%22${encodeURIComponent(book.title)}%22`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-xl transition-all hover:shadow text-sm"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.665.988 3.311 1.488 4.968 1.49 5.48-.002 9.935-4.461 9.938-9.94.001-2.654-1.031-5.148-2.907-7.027-1.876-1.879-4.373-2.914-7.029-2.915-5.483 0-9.94 4.46-9.943 9.94-.001 1.84.482 3.633 1.398 5.2L1.698 22.25l4.949-1.796zM15.898 13.06c-.327-.162-1.924-.946-2.221-1.054-.297-.108-.513-.162-.73.162-.216.324-.836 1.054-1.026 1.27-.19.216-.38.243-.707.081-.327-.162-1.38-.507-2.63-1.62-1-.89-1.675-1.99-1.87-2.314-.195-.324-.02-.5-.183-.661-.147-.146-.327-.378-.49-.567-.163-.189-.217-.324-.327-.54-.109-.217-.055-.405-.027-.567.027-.162.216-.513.324-.675.108-.162.144-.27.216-.405.072-.135.036-.253-.018-.363-.054-.108-.513-1.236-.707-1.697-.19-.459-.399-.395-.54-.402-.14-.007-.301-.007-.461-.007s-.422.06-.643.301c-.22.242-.84.821-.84 2.002 0 1.181.86 2.321.98 2.483.12.162 1.693 2.581 4.1 3.62.573.247 1.02.395 1.37.505.576.183 1.1.157 1.51.096.458-.069 1.925-.788 2.197-1.509.272-.72.272-1.336.19-1.497-.08-.161-.297-.27-.624-.432z"/>
                      </svg>
                      Tertarik? Hubungi Radar Kediri
                    </a>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success('Link buku disalin ke clipboard');
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-xl transition-colors text-sm"
                    >
                      <Share2 className="w-4 h-4" />
                      Bagikan Link Buku
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Description & More */}
            <div className="lg:col-span-2 space-y-8">
              {/* Sinopsis */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Sinopsis Buku</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {book.description || 'Tidak ada deskripsi sinopsis untuk buku ini.'}
                </p>
              </div>

              {/* Buku Lainnya */}
              {otherBooks.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Buku Lainnya</h2>
                    <Link href="/books" className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1">
                      Lihat Semua
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {otherBooks.map((b) => (
                      <Link 
                        href={`/books/${b.id}`} 
                        key={b.id}
                        className="bg-white rounded-xl shadow-sm overflow-hidden group hover:-translate-y-1 transition-all duration-300 border border-gray-100 block"
                      >
                        <div className="aspect-[3/4] relative bg-gray-50">
                          <Image src={b.coverUrl || '/books/cover.jpg'} alt={b.title} fill className="object-cover" />
                        </div>
                        <div className="p-3">
                          <h4 className="font-bold text-gray-900 line-clamp-1 text-sm">{b.title}</h4>
                          <p className="text-gray-500 text-xs mt-0.5">{b.author}</p>
                          <p className="text-amber-600 font-semibold text-xs mt-1">
                            Baca Digital Gratis
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ============ PDF READER VIEW ============ */
          <div className="select-none">
            {/* Reader toolbar */}
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowPdf(false)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Kembali ke Detail</span>
                </button>
                <div className="hidden sm:block h-6 w-px bg-gray-200" />
                <div className="hidden sm:block">
                  <h2 className="font-bold text-gray-900">{book.title}</h2>
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    Mode Proteksi Baca: Hanya Dapat Dibaca
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Layar Penuh</span>
                </button>
                {/* 
                  NOTE: NO DOWNLOAD/UNDUH BUTTON HERE!
                  Ini membedakan buku (read-only) dengan koran (sudah menjadi milik pembeli & bisa diunduh)
                */}
              </div>
            </div>

            {/* PDF Viewer - Read Only with navpanes & toolbar disabled in iframe URL */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-amber-200">
              <iframe
                src={`${pdfAccessUrl || book.pdfUrl}#toolbar=0&navpanes=0&messages=0`}
                className="w-full"
                style={{ height: 'calc(100vh - 220px)', minHeight: '600px' }}
                title={`${book.title} - Read Only Reader`}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
