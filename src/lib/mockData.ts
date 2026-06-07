// Mock Data untuk Koran
export interface Paper {
  id: string
  title: string
  date: string
  coverUrl: string
  pdfUrl: string
  price: number
  pageCount: number
  isToday: boolean
}

export const papers: Paper[] = [
  // Edisi Hari Ini
  {
    id: '1',
    title: 'Radar Kediri',
    date: '2026-02-03',
    coverUrl: '/images/newspapers/cover-kediri.jpg',
    pdfUrl: '/newspapers/radar-kediri-20260203.pdf',
    price: 10000,
    pageCount: 24,
    isToday: true,
  },
  // Arsip / Edisi Sebelumnya
  {
    id: '2',
    title: 'Radar Kediri',
    date: '2026-02-02',
    coverUrl: '/images/newspapers/cover-kediri-2.jpg',
    pdfUrl: '/newspapers/radar-kediri-20260202.pdf',
    price: 10000,
    pageCount: 24,
    isToday: false,
  },
  {
    id: '3',
    title: 'Radar Nganjuk',
    date: '2026-02-02',
    coverUrl: '/images/newspapers/cover-nganjuk.jpg',
    pdfUrl: '/newspapers/radar-nganjuk-20260202.pdf',
    price: 10000,
    pageCount: 20,
    isToday: false,
  },
  {
    id: '4',
    title: 'Radar Kediri',
    date: '2026-02-02',
    coverUrl: '/images/newspapers/cover-kediri.jpg',
    pdfUrl: '/newspapers/radar-kediri-20260202b.pdf',
    price: 10000,
    pageCount: 24,
    isToday: false,
  },
  {
    id: '5',
    title: 'Radar Nganjuk',
    date: '2026-02-01',
    coverUrl: '/images/newspapers/cover-nganjuk-2.jpg',
    pdfUrl: '/newspapers/radar-nganjuk-20260201.pdf',
    pageCount: 20,
    price: 10000,
    isToday: false,
  },
  {
    id: '6',
    title: 'Radar Kediri',
    date: '2026-02-01',
    coverUrl: '/images/newspapers/cover-kediri-2.jpg',
    pdfUrl: '/newspapers/radar-kediri-20260201.pdf',
    price: 10000,
    pageCount: 24,
    isToday: false,
  },
  {
    id: '7',
    title: 'Radar Nganjuk',
    date: '2026-02-01',
    coverUrl: '/images/newspapers/cover-nganjuk-2.jpg',
    pdfUrl: '/newspapers/radar-nganjuk-20260201b.pdf',
    price: 10000,
    pageCount: 20,
    isToday: false,
  },
]

// Helper functions for Papers
export const getTodayPaper = () => papers.find(paper => paper.isToday)
export const getArchivePapers = () => papers.filter(paper => !paper.isToday)
export const getAllPapers = () => papers
export const getPaperById = (id: string) => papers.find(paper => paper.id === id)

// ============================================
// BOOKS (Buku Terbitan Radar Kediri)
// ============================================
export interface Book {
  id: string
  title: string
  author: string
  date: string
  coverUrl: string
  price: number
  description: string
  category: string
}

export const books: Book[] = [
  {
    id: 'book-1',
    title: 'Sejarah Kediri: Dari Kerajaan Hingga Kini',
    author: 'Tim Redaksi Radar Kediri',
    date: '2026-01-15',
    coverUrl: '/images/books/book-sejarah.jpg',
    price: 75000,
    description: 'Menelusuri jejak sejarah Kota Kediri dari masa kerajaan hingga era modern.',
    category: 'Sejarah',
  },
  {
    id: 'book-2',
    title: 'Kuliner Legendaris Kediri',
    author: 'Dewi Sartika',
    date: '2026-01-10',
    coverUrl: '/images/books/book-kuliner.jpg',
    price: 50000,
    description: 'Panduan lengkap kuliner khas Kediri yang wajib dicoba.',
    category: 'Kuliner',
  },
  {
    id: 'book-3',
    title: 'Wisata Alam Jawa Timur',
    author: 'Ahmad Fauzi',
    date: '2026-01-05',
    coverUrl: '/images/books/book-wisata.jpg',
    price: 65000,
    description: 'Eksplorasi destinasi wisata alam tersembunyi di Jawa Timur.',
    category: 'Travel',
  },
  {
    id: 'book-4',
    title: 'UMKM Kediri: Kisah Sukses',
    author: 'Tim Ekonomi Radar Kediri',
    date: '2025-12-20',
    coverUrl: '/images/books/book-umkm.jpg',
    price: 55000,
    description: 'Kumpulan kisah inspiratif pelaku UMKM sukses di Kediri.',
    category: 'Bisnis',
  },
  {
    id: 'book-5',
    title: 'Legenda & Mitos Kediri',
    author: 'Prof. Slamet Widodo',
    date: '2025-11-15',
    coverUrl: '/images/books/book-legenda.jpg',
    price: 60000,
    description: 'Menguak cerita rakyat dan mitos yang hidup di masyarakat Kediri.',
    category: 'Budaya',
  },
  {
    id: 'book-6',
    title: 'Fotografi Jurnalistik: Panduan Praktis',
    author: 'Budi Santoso',
    date: '2025-10-10',
    coverUrl: '/images/books/book-foto.jpg',
    price: 85000,
    description: 'Belajar teknik fotografi jurnalistik dari fotografer profesional.',
    category: 'Fotografi',
  },
]

// Helper functions for Books
export const getBooks = () => books
export const getBooksByCategory = (category: string) => books.filter(book => book.category === category)


// ============================================
// RADAR EVENT
// ============================================
export interface Event {
  id: string
  title: string
  date: string // ISO DateTime string
  imageUrl: string
  location: string
  ticketLink: string 
}

export const events: Event[] = [
  {
    id: 'event-1',
    title: 'Waru Turi Fun Run 2026',
    date: '2026-02-15T09:00:00',
    imageUrl: '/images/events/waru-turi-fun-run.jpg',
    location: 'Bendungan Waru Turi, Kediri',
    ticketLink: 'https://tiket.radarkediri.id/waru-turi-fun-run',
  },
  {
    id: 'event-2',
    title: 'Job Fair Kediri Raya',
    date: '2026-02-20T08:00:00',
    imageUrl: '/images/events/job-fair.jpg',
    location: 'Gedung Serbaguna Kediri',
    ticketLink: 'https://tiket.radarkediri.id/job-fair',
  },
  {
    id: 'event-3',
    title: 'Konser Musik Rakyat',
    date: '2026-03-01T19:00:00',
    imageUrl: '/images/events/konser-musik.jpg',
    location: 'Stadion Brawijaya Kediri',
    ticketLink: 'https://tiket.radarkediri.id/konser-musik',
  },
  {
    id: 'event-4',
    title: 'Seminar UMKM Go Digital',
    date: '2026-02-25T13:00:00',
    imageUrl: '/images/events/seminar-umkm.jpg',
    location: 'Hotel Grand Surya Kediri',
    ticketLink: 'https://tiket.radarkediri.id/seminar-umkm',
  },
]

// Helper functions for Events
export const getEvents = () => events
export const getUpcomingEvents = () => {
  const now = new Date()
  return events.filter(event => new Date(event.date) > now)
}
