'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  ChevronRight,
  Maximize2,
  Download,
  Share2,
  Calendar,
  FileText,
  ShoppingCart
} from 'lucide-react'
import EditionCard from '@/components/EditionCard'
import { supabase } from '@/lib/supabase'
import { useCartStore } from '@/lib/store/cartStore'
import toast from 'react-hot-toast'

interface Edition {
  id: number
  title: string
  publishDate: string
  coverImageUrl: string
  pdfUrl: string
  price: number | string
  pageCount?: number
}

export default function NewspaperDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const [paper, setPaper] = useState<Edition | null>(null)
  const [loading, setLoading] = useState(true)
  const [archivePapers, setArchivePapers] = useState<Edition[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showPdf, setShowPdf] = useState(false)
  const [pdfAccessUrl, setPdfAccessUrl] = useState<string | null>(null)
  const [accessError, setAccessError] = useState<string | null>(null)
  const [checkingAccess, setCheckingAccess] = useState(false)

  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    if (!paper) return
    addItem({
      id: String(paper.id),
      type: 'newspaper',
      title: paper.title,
      subtitle: formattedDate,
      coverUrl: paper.coverImageUrl,
      price: Number(paper.price),
      quantity: 1,
    })
    toast.success(`${paper.title} ditambahkan ke keranjang`)
  }

  const handleReadNow = async () => {
    if (!paper) return
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      alert('Silakan login terlebih dahulu untuk membaca e-paper.')
      window.location.href = `/auth/login?redirect=/newspapers/${params.id}`
      return
    }

    const userObj = JSON.parse(storedUser)

    // Jika demo user, bypass request server
    if (userObj.id === 'demo-user-id') {
      setPdfAccessUrl(paper.pdfUrl)
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
        body: JSON.stringify({ editionId: paper.id })
      })

      const result = await response.json()

      if (response.ok && result.url) {
        setPdfAccessUrl(result.url)
        setShowPdf(true)
      } else {
        setAccessError(result.error || 'Akses ditolak. Silakan beli edisi ini atau berlangganan.')
      }
    } catch (error) {
      console.error('Error verifying access:', error)
      setAccessError('Gagal memverifikasi akses. Silakan coba lagi.')
    } finally {
      setCheckingAccess(false)
    }
  }

  useEffect(() => {
    fetchEdition()
    fetchArchivePapers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const fetchEdition = async () => {
    try {
      const response = await fetch(`/api/editions/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setPaper(data)
      }
    } catch (error) {
      console.error('Failed to fetch edition:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchArchivePapers = async () => {
    try {
      const response = await fetch('/api/editions')
      if (response.ok) {
        const data = await response.json()
        setArchivePapers(data.slice(0, 4))
      }
    } catch (error) {
      console.error('Failed to fetch archive papers:', error)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 pt-32 lg:pt-40 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    )
  }

  if (!paper) {
    return (
      <main className="min-h-screen bg-gray-50 pt-32 lg:pt-40 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Edisi tidak ditemukan</h1>
          <Link href="/newspapers" className="text-primary hover:underline">
            Kembali ke Arsip
          </Link>
        </div>
      </main>
    )
  }

  const formattedDate = new Date(paper.publishDate).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(paper.price))

  // Fullscreen PDF viewer
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-gray-900">
        {/* Fullscreen toolbar */}
        <div className="absolute top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFullscreen(false)}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-white font-medium">{paper.title} - {formattedDate}</span>
          </div>
          <button
            onClick={() => setIsFullscreen(false)}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            Tutup (Esc)
          </button>
        </div>

        {/* PDF iframe fullscreen */}
        <iframe
          src={pdfAccessUrl || paper.pdfUrl}
          className="w-full h-full pt-14"
          title={`${paper.title} - ${formattedDate}`}
        />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-28 lg:pt-36 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/newspapers" className="hover:text-primary transition-colors">Arsip Koran</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">{paper.title}</span>
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
                    src={paper.coverImageUrl}
                    alt={`Cover ${paper.title}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    priority
                  />
                  {/* isToday badge removed - not in schema */}
                </div>

                {/* Info */}
                <div className="p-5 space-y-4">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 mb-1">{paper.title}</h1>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <FileText className="w-4 h-4" />
                    <span>{paper.pageCount || 1} Halaman</span>
                  </div>

                  {/* Price */}
                  <div className="bg-primary/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">Harga</p>
                    <p className="text-2xl font-bold text-primary">{formattedPrice}</p>
                  </div>

                  {/* Action Buttons */}
                  {accessError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl mb-4 text-center">
                      <p className="font-semibold mb-2">{accessError}</p>
                      <div className="flex flex-col gap-2 mt-2">
                        <Link 
                          href="/subscription"
                          className="bg-primary hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg text-xs"
                        >
                          Lihat Paket Langganan
                        </Link>
                        <Link 
                          href="/cart"
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg text-xs block text-center"
                        >
                          Beli Edisi Ini
                        </Link>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleReadNow}
                    disabled={checkingAccess}
                    className="w-full bg-[#005596] hover:bg-[#004580] disabled:bg-gray-400 text-white font-bold py-3.5 px-6 rounded-xl transition-all hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    {checkingAccess ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Memverifikasi Akses...
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        Baca Sekarang
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={handleAddToCart}
                      className="flex items-center justify-center gap-2 bg-[#006CB9] hover:bg-[#005596] text-white font-medium py-2.5 px-4 rounded-xl transition-colors text-sm font-sans"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Beli
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-xl transition-colors text-sm">
                      <Share2 className="w-4 h-4" />
                      Bagikan
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Preview & More */}
            <div className="lg:col-span-2 space-y-8">
              {/* PDF Preview */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">Pratinjau Koran</h2>
                  <p className="text-sm text-gray-500 mt-1">Klik &quot;Baca Sekarang&quot; untuk membaca edisi lengkap</p>
                </div>
                <div className="relative aspect-[4/3] bg-gray-100 cursor-pointer group" onClick={handleReadNow}>
                  <iframe
                    src={`${paper.pdfUrl}#page=1&view=FitH`}
                    className="w-full h-full pointer-events-none"
                    title={`Preview ${paper.title}`}
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-xl font-bold text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg flex items-center gap-2">
                      <Maximize2 className="w-5 h-5" />
                      Baca Edisi Lengkap
                    </div>
                  </div>
                </div>
              </div>

              {/* Edisi Lainnya */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Edisi Lainnya</h2>
                  <Link href="/newspapers" className="text-primary hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                    Lihat Semua
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {archivePapers.map((p) => (
                    <EditionCard
                      key={p.id}
                      id={p.id.toString()}
                      title={p.title}
                      date={new Date(p.publishDate).toLocaleDateString('id-ID')}
                      coverImage={p.coverImageUrl}
                      price={Number(p.price)}
                      href={`/newspapers/${p.id}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ============ PDF READER VIEW ============ */
          <div>
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
                  <h2 className="font-bold text-gray-900">{paper.title}</h2>
                  <p className="text-xs text-gray-500">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Layar Penuh</span>
                </button>
                <a
                  href={pdfAccessUrl || paper.pdfUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#005596] hover:bg-[#004580] text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Unduh</span>
                </a>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <iframe
                src={pdfAccessUrl || paper.pdfUrl}
                className="w-full"
                style={{ height: 'calc(100vh - 220px)', minHeight: '600px' }}
                title={`${paper.title} - ${formattedDate}`}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
