'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { BookOpen, Search, ChevronDown, ShoppingCart, Tag } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import toast from 'react-hot-toast'

interface Book {
  id: string
  title: string
  author: string
  publishDate: string
  coverUrl: string
  price: number | string
  description: string | null
  category: string
}

function BooksContent() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const searchParams = useSearchParams()
  const urlQuery = searchParams.get('q') || ''

  useEffect(() => {
    setSearchQuery(urlQuery)
  }, [urlQuery])

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books')
      if (response.ok) {
        const data = await response.json()
        setBooks(data)
      }
    } catch (e) {
      console.error('Failed to fetch books:', e)
    } finally {
      setLoading(false)
    }
  }

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(books.map(book => book.category)))]

  // Filter books
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-32 lg:pt-40 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl mb-4">
            <BookOpen className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Toko Buku Digital
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Koleksi buku terbitan Radar Kediri. Dari sejarah lokal hingga panduan bisnis,
            temukan bacaan berkualitas untuk menambah wawasan Anda.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari judul atau penulis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none w-full sm:w-48 pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'Semua Kategori' : cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Menampilkan <span className="font-semibold text-gray-900">{filteredBooks.length}</span> buku
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-amber-500 animate-pulse" />
            </div>
            <p className="text-gray-500">Memuat buku...</p>
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {filteredBooks.map((book) => (
              <div 
                key={book.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
              >
                {/* Cover */}
                <Link href={`/books/${book.id}`} className="aspect-[3/4] relative bg-gray-100 overflow-hidden block">
                  <Image
                    src={book.coverUrl}
                    alt={book.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      <Tag className="w-3 h-3" />
                      {book.category}
                    </span>
                  </div>
                </Link>

                {/* Info */}
                <div className="p-4">
                  <Link href={`/books/${book.id}`} className="block">
                    <h3 className="font-bold text-gray-900 line-clamp-2 mb-1 group-hover:text-amber-600 transition-colors">
                      {book.title}
                    </h3>
                  </Link>
                  <p className="text-gray-500 text-sm mb-2">{book.author}</p>
                  <p className="text-amber-600 font-semibold text-xs mb-3 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> Baca Digital Gratis
                  </p>
                  
                  <Link 
                    href={`/books/${book.id}`}
                    className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 rounded-xl transition-colors text-sm font-sans"
                  >
                    <BookOpen className="w-4 h-4" />
                    Baca & Detail
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada hasil</h3>
            <p className="text-gray-500">Coba ubah kata kunci atau kategori pencarian</p>
          </div>
        )}
      </div>
    </main>
  )
}

export default function BooksPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50 pt-32 lg:pt-40 pb-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600 mx-auto"></div>
      </main>
    }>
      <BooksContent />
    </Suspense>
  )
}
