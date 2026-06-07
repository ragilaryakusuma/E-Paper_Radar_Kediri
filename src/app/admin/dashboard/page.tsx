'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/context/AuthContext'
import { 
  Newspaper, 
  Calendar, 
  Menu, 
  X, 
  Upload, 
  Trash2, 
  Pencil,
  FileText,
  Image as ImageIcon,
  Clock,
  MapPin,
  Eye,
  EyeOff,
  Check,
  Ban,
  ChevronLeft,
  LogOut,
  LayoutDashboard,
  Briefcase,
  Plus,
  Zap,
  GraduationCap,
  Building2,
  DollarSign,
  Users
} from 'lucide-react'
import { papers, events } from '@/lib/mockData'

type TabType = 'koran' | 'event'

// Sidebar Menu Items
const menuItems = [
  { id: 'koran' as TabType, label: 'Upload Koran', icon: Newspaper },
  { id: 'event' as TabType, label: 'Kelola Event', icon: Calendar },
]

export default function AdminDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('koran')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Memuat halaman...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">Admin Panel</h1>
                <p className="text-xs text-gray-500">Radar Kediri</p>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <a 
              href="/"
              className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Kembali ke Website</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 hidden lg:block">
              {menuItems.find(item => item.id === activeTab)?.label}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Admin</span>
              <div className="w-8 h-8 bg-gray-300 rounded-full" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-4 lg:p-6">
          {activeTab === 'koran' && <UploadKoranTab />}
          {activeTab === 'event' && <KelolaEventTab />}
        </main>
      </div>
    </div>
  )
}

// =============================================
// TAB: UPLOAD KORAN
// =============================================
interface Edition {
  id: number
  title: string
  publishDate: string
  coverImageUrl: string
  pdfUrl: string
  price: string | number
}

function UploadKoranTab() {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    price: '50000',
    coverImage: null as File | null,
    pdfFile: null as File | null,
  })
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [editions, setEditions] = useState<Edition[]>([])
  const [loading, setLoading] = useState(true)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  // Fetch editions on mount
  useEffect(() => {
    fetchEditions()
  }, [])

  const fetchEditions = async () => {
    try {
      const response = await fetch('/api/editions')
      if (response.ok) {
        const data = await response.json()
        setEditions(data)
      }
    } catch (error) {
      console.error('Failed to fetch editions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, coverImage: file }))
      const reader = new FileReader()
      reader.onloadend = () => setCoverPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, pdfFile: file }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.date || !formData.coverImage || !formData.pdfFile) {
      alert('Harap lengkapi semua field')
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      let token = session?.access_token

      if (!token) {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const userObj = JSON.parse(storedUser)
          if (userObj.id === 'admin-user-id') {
            token = 'mock-admin-token'
          }
        }
      }

      const uploadFormData = new FormData()
      uploadFormData.append('title', formData.title)
      uploadFormData.append('publishDate', formData.date)
      uploadFormData.append('price', formData.price)
      uploadFormData.append('coverImage', formData.coverImage)
      uploadFormData.append('pdfFile', formData.pdfFile)

      const response = await fetch('/api/editions', {
        method: 'POST',
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {},
        body: uploadFormData,
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Error: ${error.error}`)
        return
      }

      const result = await response.json()
      alert(`✅ Koran "${result.title}" berhasil diupload!`)
      
      // Reset form
      setFormData({
        title: '',
        date: '',
        price: '50000',
        coverImage: null,
        pdfFile: null,
      })
      setCoverPreview(null)

      // Refresh editions list
      await fetchEditions()
    } catch (error) {
      console.error('Upload error:', error)
      alert('Gagal mengupload koran. Cek console untuk detail.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Upload Koran Baru</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Form Fields */}
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Koran
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Contoh: Radar Kediri"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Edisi
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  required
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harga (Rp)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="50000"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  required
                />
              </div>

              {/* PDF Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File PDF Koran
                </label>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">
                    {formData.pdfFile ? formData.pdfFile.name : 'Pilih file PDF'}
                  </span>
                </button>
              </div>
            </div>

            {/* Right: Cover Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Image
              </label>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
              <div 
                onClick={() => coverInputRef.current?.click()}
                className="aspect-[3/4] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors overflow-hidden relative"
              >
                {coverPreview ? (
                  <Image
                    src={coverPreview}
                    alt="Cover preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="w-12 h-12 mb-2" />
                    <span className="text-sm">Klik untuk upload cover</span>
                    <span className="text-xs">Format: JPG, PNG</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-primary hover:bg-primary-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              <Upload className="w-5 h-5" />
              Upload Koran
            </button>
          </div>
        </form>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Daftar Koran</h3>
        </div>
        {loading ? (
          <div className="p-6 text-center text-gray-600">Loading...</div>
        ) : editions.length === 0 ? (
          <div className="p-6 text-center text-gray-600">Belum ada koran yang diupload</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cover</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Judul</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Harga</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {editions.map((edition) => (
                  <tr key={edition.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="w-12 h-16 bg-gray-200 rounded overflow-hidden relative">
                        <Image 
                          src={edition.coverImageUrl} 
                          alt={edition.title} 
                          fill 
                          className="object-cover" 
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{edition.title}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(edition.publishDate).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      Rp {Number(edition.price).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// =============================================
// TAB: KELOLA EVENT
// =============================================
function KelolaEventTab() {
  interface DBEvent {
    id: string
    title: string
    date: string
    imageUrl: string
    location: string
    ticketLink?: string | null
  }

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    ticketLink: '',
    bannerImage: null as File | null,
  })
  const [events, setEvents] = useState<DBEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [editingEvent, setEditingEvent] = useState<DBEvent | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/events')
      if (res.ok) {
        const data = await res.json()
        setEvents(data)
      }
    } catch (e) {
      console.error('Failed to fetch events:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, bannerImage: file }))
      const reader = new FileReader()
      reader.onloadend = () => setBannerPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleEdit = (event: DBEvent) => {
    const d = new Date(event.date)
    // Extract YYYY-MM-DD local format
    const offset = d.getTimezoneOffset()
    const localDate = new Date(d.getTime() - offset * 60 * 1000)
    const datePart = localDate.toISOString().split('T')[0]
    
    // Extract HH:MM format
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const timePart = `${hours}:${minutes}`

    setEditingEvent(event)
    setFormData({
      title: event.title,
      date: datePart,
      time: timePart,
      location: event.location,
      ticketLink: event.ticketLink || '',
      bannerImage: null, // User can optionally upload a new image
    })
    setBannerPreview(event.imageUrl)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      time: '',
      location: '',
      ticketLink: '',
      bannerImage: null,
    })
    setBannerPreview(null)
    setEditingEvent(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.date || !formData.time || !formData.location) {
      alert('Harap lengkapi semua field wajib')
      return
    }

    if (!editingEvent && !formData.bannerImage) {
      alert('Harap upload banner event')
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      let token = session?.access_token

      if (!token) {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const userObj = JSON.parse(storedUser)
          if (userObj.id === 'admin-user-id') {
            token = 'mock-admin-token'
          }
        }
      }

      const uploadFormData = new FormData()
      uploadFormData.append('title', formData.title)
      
      // Combine date and time
      const datetime = new Date(`${formData.date}T${formData.time}`).toISOString()
      uploadFormData.append('date', datetime)
      uploadFormData.append('location', formData.location)
      uploadFormData.append('ticketLink', formData.ticketLink)
      if (formData.bannerImage) {
        uploadFormData.append('bannerImage', formData.bannerImage)
      }

      const url = editingEvent ? `/api/events/${editingEvent.id}` : '/api/events'
      const method = editingEvent ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {},
        body: uploadFormData,
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Error: ${error.error}`)
        return
      }

      const result = await response.json()
      alert(`✅ Event "${result.title}" berhasil ${editingEvent ? 'diperbarui' : 'ditambahkan'}!`)
      
      resetForm()
      await fetchEvents()
    } catch (e) {
      console.error(e)
      alert('Gagal menyimpan event. Cek console.')
    }
  }

  const handleDelete = async (event: DBEvent) => {
    if (!confirm(`Yakin ingin menghapus event "${event.title}"?`)) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      let token = session?.access_token

      if (!token) {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const userObj = JSON.parse(storedUser)
          if (userObj.id === 'admin-user-id') {
            token = 'mock-admin-token'
          }
        }
      }

      const response = await fetch(`/api/events/${event.id}`, {
        method: 'DELETE',
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {},
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Error: ${error.error}`)
        return
      }

      alert(`✅ Event "${event.title}" berhasil dihapus!`)
      await fetchEvents()
    } catch (e) {
      console.error(e)
      alert('Gagal menghapus event.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          {editingEvent ? `Edit Event: ${editingEvent.title}` : 'Tambah Event Baru'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Banner Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banner Event
            </label>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              className="hidden"
            />
            <div 
              onClick={() => bannerInputRef.current?.click()}
              className="aspect-[21/9] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors overflow-hidden relative"
            >
              {bannerPreview ? (
                <Image
                  src={bannerPreview}
                  alt="Banner preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon className="w-12 h-12 mb-2" />
                  <span className="text-sm">Klik untuk upload banner</span>
                  <span className="text-xs">Rasio 21:9 (1920x820px)</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Event
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Contoh: Festival Kuliner Kediri 2026"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                required
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Tanggal
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                required
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                Jam
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Lokasi
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Contoh: Alun-Alun Kediri"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                required
              />
            </div>

            {/* Ticket Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link Tiket (Optional)
              </label>
              <input
                type="url"
                value={formData.ticketLink}
                onChange={(e) => setFormData(prev => ({ ...prev, ticketLink: e.target.value }))}
                placeholder="https://..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            {editingEvent && (
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-6 py-2.5 rounded-lg transition-colors"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              className="flex items-center gap-2 bg-primary hover:bg-primary-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              <Calendar className="w-5 h-5" />
              {editingEvent ? 'Perbarui Event' : 'Simpan Event'}
            </button>
          </div>
        </form>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Daftar Event</h3>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Memuat daftar event...</div>
          ) : events.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Belum ada event terdaftar</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lokasi</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-10 bg-gray-200 rounded overflow-hidden relative flex-shrink-0">
                          {event.imageUrl ? (
                            <Image src={event.imageUrl} alt={event.title} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-gray-900">{event.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(event.date).toLocaleDateString('id-ID', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{event.location}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(event)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(event)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}


