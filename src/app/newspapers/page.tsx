'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Newspaper, Search, ChevronDown } from 'lucide-react'
import EditionCard from '@/components/EditionCard'
import { useAuth } from '@/lib/context/AuthContext'
import { supabase } from '@/lib/supabase'

interface Edition {
  id: number
  title: string
  publishDate: string
  coverImageUrl: string
  price: number | string
}

function NewspapersContent() {
  const { user } = useAuth()
  const [papers, setPapers] = useState<Edition[]>([])
  const [purchasedIds, setPurchasedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')

  const searchParams = useSearchParams()
  const urlQuery = searchParams.get('q') || ''

  useEffect(() => {
    setSearchQuery(urlQuery)
  }, [urlQuery])

  useEffect(() => {
    fetchEditions()
  }, [])

  useEffect(() => {
    if (user?.id) {
      fetchPurchasedIds()
    } else {
      setPurchasedIds([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchPurchasedIds = async () => {
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
        const ids = (data.newspapers || []).map((paper: any) => paper.id)
        setPurchasedIds(ids)
      }
    } catch (e) {
      console.error('Failed to fetch user purchases:', e)
    }
  }

  const fetchEditions = async () => {
    try {
      const response = await fetch('/api/editions')
      if (response.ok) {
        const data = await response.json()
        setPapers(data)
      }
    } catch (error) {
      console.error('Failed to fetch editions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort papers
  const filteredPapers = papers
    .filter(paper =>
      paper.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.publishDate).getTime()
      const dateB = new Date(b.publishDate).getTime()
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB
    })

  return (
    <main className="min-h-screen bg-gray-50 pt-32 lg:pt-40 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
            <Newspaper className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Arsip Koran Digital
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Akses edisi terbaru dan arsip koran Radar Kediri.
            Baca berita terkini kapan saja, di mana saja.
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
                placeholder="Cari koran..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                className="appearance-none w-full sm:w-48 pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-white cursor-pointer"
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Menampilkan <span className="font-semibold text-gray-900">{filteredPapers.length}</span> edisi
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Newspaper className="w-10 h-10 text-gray-400 animate-pulse" />
            </div>
            <p className="text-gray-500">Memuat edisi...</p>
          </div>
        ) : filteredPapers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {filteredPapers.map((paper) => (
              <EditionCard
                key={paper.id}
                id={paper.id.toString()}
                title={paper.title}
                date={new Date(paper.publishDate).toLocaleDateString('id-ID')}
                coverImage={paper.coverImageUrl}
                price={Number(paper.price)}
                href={`/newspapers/${paper.id}`}
                hasAccess={purchasedIds.includes(paper.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Newspaper className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada hasil</h3>
            <p className="text-gray-500">Coba ubah kata kunci pencarian Anda</p>
          </div>
        )}
      </div>
    </main>
  )
}

export default function NewspapersPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50 pt-32 lg:pt-40 pb-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006CB9] mx-auto"></div>
      </main>
    }>
      <NewspapersContent />
    </Suspense>
  )
}
