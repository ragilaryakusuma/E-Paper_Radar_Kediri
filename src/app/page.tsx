'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MessageCircle, Car, Home, Sparkles, ChevronRight } from 'lucide-react'
import EditionCard from '@/components/EditionCard'
import HeroHighlight from '@/components/HeroHighlight'
import EventBanner from '@/components/home/EventBanner'
import { FadeIn, StaggerChildren, StaggerItem, SlideIn } from '@/components/animations'

interface Paper {
  id: number
  title: string
  publishDate: string
  coverImageUrl: string
  pdfUrl: string
  price: number | string
  pageCount?: number
}

interface Book {
  id: string
  title: string
  author: string
  publishDate: string
  coverUrl: string
  price: number | string
  category: string
}

interface Event {
  id: string
  title: string
  date: string
  imageUrl: string
  location: string
  ticketLink?: string | null
}



// Kategori Iklan Jitu
const iklanCategories = [
  { name: 'Mobil & Motor', icon: Car, color: 'bg-blue-500 hover:bg-blue-600', href: '/iklan/otomotif' },
  { name: 'Properti', icon: Home, color: 'bg-amber-700 hover:bg-amber-800', href: '/iklan/properti' },
  { name: 'Ragam', icon: Sparkles, color: 'bg-yellow-500 hover:bg-yellow-600', href: '/iklan/ragam' },
]

export default function HomePage() {
  const [todayPaper, setTodayPaper] = useState<Paper | null>(null)
  const [archivePapers, setArchivePapers] = useState<Paper[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch newspapers
        const paperRes = await fetch('/api/editions')
        if (paperRes.ok) {
          const papersData = await paperRes.json()
          if (papersData.length > 0) {
            setTodayPaper(papersData[0])
            setArchivePapers(papersData.slice(1, 4)) // Ambil 3 edisi sebelumnya
          }
        }

        // Fetch books
        const bookRes = await fetch('/api/books')
        if (bookRes.ok) {
          const booksData = await bookRes.json()
          setBooks(booksData.slice(0, 3)) // Ambil 3 buku pertama
        }

        // Fetch events
        const eventRes = await fetch('/api/events')
        if (eventRes.ok) {
          const eventsData = await eventRes.json()
          setEvents(eventsData)
        }


      } catch (e) {
        console.error('Error fetching home data:', e)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-paper-bg flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#006CB9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium font-sans">Memuat Konten Radar Kediri...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-paper-bg pt-24 lg:pt-44">
      {/* Hero Highlight - Bento Grid Layout */}
      {todayPaper && <HeroHighlight paper={{
        id: todayPaper.id.toString(),
        title: todayPaper.title,
        date: todayPaper.publishDate,
        coverUrl: todayPaper.coverImageUrl,
        pdfUrl: todayPaper.pdfUrl,
        price: Number(todayPaper.price),
        pageCount: todayPaper.pageCount || 1,
        isToday: true
      }} />}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - 70% */}
          <div className="lg:w-[70%] space-y-10">
            {/* Newspapers Section - Arsip */}
            <section>
              <FadeIn direction="up">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Edisi Sebelumnya
                  </h2>
                  <Link 
                    href="/newspapers" 
                    className="text-primary hover:text-primary-700 font-medium flex items-center gap-1 transition-colors"
                  >
                    Lihat Semua
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </FadeIn>
              
              <StaggerChildren staggerDelay={0.1} className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
                {archivePapers.map((paper) => (
                  <StaggerItem key={paper.id}>
                    <EditionCard
                      id={paper.id.toString()}
                      title={paper.title}
                      date={new Date(paper.publishDate).toLocaleDateString('id-ID')}
                      coverImage={paper.coverImageUrl}
                      price={Number(paper.price)}
                      href={`/newspapers/${paper.id}`}
                    />
                  </StaggerItem>
                ))}
              </StaggerChildren>
            </section>

            {/* Books Section */}
            <section>
              <FadeIn direction="up">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Buku Pilihan
                  </h2>
                  <Link 
                    href="/library" 
                    className="text-primary hover:text-primary-700 font-medium flex items-center gap-1 transition-colors"
                  >
                    Lihat Semua
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </FadeIn>
              
              <StaggerChildren staggerDelay={0.1} className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
                {books.map((book) => (
                  <StaggerItem key={book.id}>
                    <EditionCard
                      id={book.id}
                      title={book.title}
                      date={new Date(book.publishDate).toLocaleDateString('id-ID')}
                      coverImage={book.coverUrl}
                      price={Number(book.price)}
                      href={`/library/${book.id}`}
                    />
                  </StaggerItem>
                ))}
              </StaggerChildren>
            </section>
          </div>

          {/* Right Column - Sidebar 30% */}
          <aside className="lg:w-[30%] space-y-6">
            {/* Banner Iklan Vertikal */}
            <SlideIn direction="right">
              <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="aspect-[3/4] bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-400 p-4">
                    <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-3 flex items-center justify-center">
                      <span className="text-2xl">📢</span>
                    </div>
                    <p className="font-medium">Space Iklan</p>
                    <p className="text-sm">300 x 400</p>
                  </div>
                </div>
              </div>
            </SlideIn>

            {/* Iklan Jitu Section */}
            <SlideIn direction="right" delay={0.2}>
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Iklan Jitu
                </h3>
                <div className="space-y-2">
                  {iklanCategories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg text-white font-medium transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${category.color}`}
                    >
                      <category.icon className="w-5 h-5 flex-shrink-0" />
                      <span>{category.name}</span>
                      <ChevronRight className="w-4 h-4 ml-auto opacity-70" />
                    </Link>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Pasang iklan Anda sekarang!
                </p>
              </div>
            </SlideIn>
          </aside>
        </div>
      </main>

      {/* Event Banner - Full Width */}
      {(() => {
        const upcomingEvent = events.find(event => new Date(event.date).getTime() > Date.now());
        return upcomingEvent ? <EventBanner event={upcomingEvent} /> : null;
      })()}



      {/* Floating WhatsApp Button */}
      <Link
        href="https://wa.me/+6285168624015"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 group"
        aria-label="Chat via WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
        {/* Tooltip */}
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Chat dengan Kami
        </span>
      </Link>
    </main>
  )
}