'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Check, Star, Zap, Crown, Newspaper, BookOpen, 
  Calendar, Gift, ArrowRight, Sparkles, Laptop, 
  Smartphone, ShieldCheck, HelpCircle, ShoppingCart 
} from 'lucide-react'
import { useAuth } from '@/lib/context/AuthContext'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState<number | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch('/api/plans')
        if (res.ok) {
          const data = await res.json()
          setPlans(data)
          // Default selection to 1 Tahun (crown/best value) or the first item
          if (data.length > 0) {
            const popularPlan = data.find((p: any) => p.name.toLowerCase() === '1 tahun')
            setSelectedPlanId(popularPlan ? popularPlan.id : data[0].id)
          }
        } else {
          toast.error('Gagal mengambil daftar paket langganan')
        }
      } catch (err) {
        console.error(err)
        toast.error('Gagal mengambil daftar paket langganan')
      } finally {
        setIsLoading(false)
      }
    }
    fetchPlans()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getPlanDetails = (name: string) => {
    switch (name.toLowerCase()) {
      case '1 bulan':
        return {
          icon: Zap,
          color: 'blue',
          popular: false,
          badgeText: 'Entry Level',
          features: [
            'Akses penuh E-Paper harian selama 30 hari',
            'Baca di hingga 2 perangkat secara bersamaan',
            'Kualitas membaca PDF High-Definition',
            'Akses arsip E-Paper 30 hari terakhir',
            'Dukungan layanan pelanggan online 24/7'
          ]
        }
      case '3 bulan':
        return {
          icon: BookOpen,
          color: 'indigo',
          popular: false,
          badgeText: 'Paling Terjangkau',
          features: [
            'Akses penuh E-Paper harian selama 90 hari',
            'Baca di hingga 3 perangkat secara bersamaan',
            'Kualitas membaca PDF High-Definition',
            'Akses penuh seluruh arsip E-Paper',
            'Dukungan pelanggan prioritas lewat WhatsApp'
          ]
        }
      case '6 bulan':
        return {
          icon: Calendar,
          color: 'purple',
          popular: false,
          badgeText: 'Paket Rekomendasi',
          features: [
            'Akses penuh E-Paper harian selama 180 hari',
            'Baca di hingga 4 perangkat secara bersamaan',
            'Kualitas membaca PDF High-Definition & Unduh Offline',
            'Akses penuh seluruh arsip E-Paper lama',
            'Dukungan VIP 24/7 & Prioritas Pembaruan'
          ]
        }
      case '9 bulan':
        return {
          icon: Newspaper,
          color: 'teal',
          popular: false,
          badgeText: 'Hemat & Praktis',
          features: [
            'Akses penuh E-Paper harian selama 270 hari',
            'Baca di hingga 4 perangkat secara bersamaan',
            'Kualitas membaca PDF High-Definition & Unduh Offline',
            'Akses penuh seluruh arsip E-Paper & Koleksi Buku Digital',
            'Bebas iklan sepenuhnya & Prioritas Pembaruan'
          ]
        }
      case '1 tahun':
        return {
          icon: Crown,
          color: 'amber',
          popular: true,
          badgeText: 'Paling Hemat (Best Value)',
          features: [
            'Akses penuh E-Paper harian selama 365 hari',
            'Baca di hingga 5 perangkat secara bersamaan',
            'Kualitas Ultra High-Definition & Mode Offline',
            'Akses penuh seluruh arsip E-Paper & Koleksi Buku Digital',
            'Prioritas rilis berita & Bebas iklan sepenuhnya',
            'Dukungan VIP khusus & Undangan Event Radar Kediri'
          ]
        }
      default:
        return {
          icon: Star,
          color: 'blue',
          popular: false,
          badgeText: 'Premium',
          features: [
            'Akses penuh ke e-paper harian',
            'Baca di berbagai perangkat sekaligus',
            'Kualitas visual HD',
            'Akses arsip terlengkap'
          ]
        }
    }
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'amber':
        return {
          bg: 'bg-amber-500',
          bgLight: 'bg-amber-50/80 text-amber-600 border-amber-100',
          text: 'text-amber-600',
          border: 'border-amber-200',
          gradient: 'from-amber-500 to-yellow-600',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          ring: 'ring-amber-500/20',
          subtext: 'text-amber-700/80'
        }
      case 'indigo':
        return {
          bg: 'bg-indigo-500',
          bgLight: 'bg-indigo-50/80 text-indigo-600 border-indigo-100',
          text: 'text-indigo-600',
          border: 'border-indigo-200',
          gradient: 'from-indigo-500 to-blue-600',
          badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          ring: 'ring-indigo-500/20',
          subtext: 'text-indigo-700/80'
        }
      case 'purple':
        return {
          bg: 'bg-purple-500',
          bgLight: 'bg-purple-50/80 text-purple-600 border-purple-100',
          text: 'text-purple-600',
          border: 'border-purple-200',
          gradient: 'from-purple-500 to-pink-600',
          badge: 'bg-purple-100 text-purple-800 border-purple-200',
          ring: 'ring-purple-500/20',
          subtext: 'text-purple-700/80'
        }
      case 'teal':
        return {
          bg: 'bg-teal-500',
          bgLight: 'bg-teal-50/80 text-teal-600 border-teal-100',
          text: 'text-teal-600',
          border: 'border-teal-200',
          gradient: 'from-teal-500 to-emerald-600',
          badge: 'bg-teal-100 text-teal-800 border-teal-200',
          ring: 'ring-teal-500/20',
          subtext: 'text-teal-700/80'
        }
      case 'blue':
      default:
        return {
          bg: 'bg-[#006CB9]',
          bgLight: 'bg-[#006CB9]/10 text-[#006CB9] border-blue-100',
          text: 'text-[#006CB9]',
          border: 'border-blue-200',
          gradient: 'from-blue-500 to-indigo-600',
          badge: 'bg-blue-100 text-[#006CB9] border-blue-200',
          ring: 'ring-[#006CB9]/20',
          subtext: 'text-[#006CB9]/80'
        }
    }
  }

  const handleSelectPlan = async (planId: number) => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu untuk berlangganan')
      router.push(`/auth/login?redirect=/subscription`)
      return
    }

    setIsProcessing(planId)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const authToken = session?.access_token || (user.id === 'demo-user-id' ? 'mock-demo-token' : undefined)

      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          userId: user.id,
          planId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal membuat transaksi pembayaran')
      }

      const { token } = data

      if ((window as any).snap) {
        (window as any).snap.pay(token, {
          onSuccess: (result: any) => {
            toast.success('Pembayaran Berhasil! Langganan Anda telah aktif.')
            router.push(`/payment/success?order_id=${result.order_id}`)
          },
          onPending: (result: any) => {
            toast.success('Pembayaran Pending. Harap segera selesaikan pembayaran.')
            router.push(`/payment/pending?order_id=${result.order_id}`)
          },
          onError: () => {
            toast.error('Pembayaran Gagal!')
            router.push('/payment/error')
          },
          onClose: () => {
            toast.error('Pembayaran dibatalkan.')
          }
        })
      } else {
        toast.error('Sistem pembayaran Midtrans tidak termuat dengan benar. Coba lagi.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat memulai pembayaran')
      console.error(err)
    } finally {
      setIsProcessing(null)
    }
  }

  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[0]
  const selectedDetails = selectedPlan ? getPlanDetails(selectedPlan.name) : null
  const selectedColors = selectedDetails ? getColorClasses(selectedDetails.color) : null

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 pt-32 lg:pt-40 pb-16 relative overflow-hidden">
      {/* Aesthetic glowing background elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#006CB9]/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-40 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 relative z-10">
          <span className="inline-flex items-center gap-2 bg-[#006CB9]/10 text-[#006CB9] font-bold px-4 py-2 rounded-full text-xs uppercase tracking-wider mb-4 border border-[#006CB9]/10">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            Akses Digital Premium
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 tracking-tight leading-none">
            Berlangganan E-Paper <span className="text-[#006CB9] bg-clip-text">Radar Kediri</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-base md:text-lg">
            Dapatkan berita terpercaya, mendalam, dan aktual dari kawasan Kediri Raya langsung di perangkat Anda setiap hari.
          </p>
        </div>

        {/* Dynamic Split Layout */}
        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <div className="relative flex items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#006CB9]"></div>
              <div className="absolute h-8 w-8 rounded-full bg-blue-100 animate-ping"></div>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 max-w-6xl mx-auto items-stretch relative z-10">
            
            {/* Left Column: Dynamic Plan Preview & Benefits (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-8 bg-gradient-to-tr from-gray-900 via-[#002244] to-[#001122] rounded-[32px] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />
              <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-600/30 transition-all duration-500"></div>
              
              <div className="relative z-10">
                {/* Active Plan Badge & Title */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {selectedColors && selectedDetails && (
                    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border ${selectedColors.badge} shadow-sm`}>
                      {selectedDetails.badgeText}
                    </span>
                  )}
                  {selectedPlan && (
                    <span className="bg-white/10 text-white/90 px-3.5 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm border border-white/5">
                      Akses {selectedPlan.durationDays} Hari
                    </span>
                  )}
                </div>

                {selectedPlan && selectedDetails && (
                  <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-3 flex items-center gap-3">
                      {selectedDetails.icon && (
                        <div className="p-2.5 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                          <selectedDetails.icon className="w-8 h-8 text-amber-400" />
                        </div>
                      )}
                      <span>Paket {selectedPlan.name}</span>
                    </h2>
                    <p className="text-gray-300 text-sm max-w-lg mb-8 leading-relaxed">
                      {selectedPlan.description || `Nikmati akses penuh tanpa batas untuk seluruh edisi surat kabar digital Radar Kediri selama ${selectedPlan.name.toLowerCase()}.`}
                    </p>
                  </div>
                )}

                {/* Features List */}
                {selectedDetails && (
                  <div className="space-y-4 mb-8">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">Keuntungan yang Didapatkan:</h4>
                    <ul className="grid sm:grid-cols-1 gap-3.5">
                      {selectedDetails.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 group/item">
                          <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:bg-blue-500/40 transition-colors">
                            <Check className="w-3 h-3 text-blue-400" />
                          </div>
                          <span className="text-gray-200 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Styled E-Paper Preview */}
              <div className="relative z-10 pt-6 border-t border-white/10">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#006CB9] flex items-center justify-center text-white shadow-md font-extrabold text-sm">
                      RK
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">E-Paper Radar Kediri</h4>
                      <p className="text-xs text-gray-400">Aplikasi Pembaca E-Paper Terintegrasi</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Akses Instan Setelah Pembayaran</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Modern Interactive Selector Card (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-white rounded-[32px] p-6 md:p-8 border border-gray-100 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl pointer-events-none"></div>

              <div>
                {/* Selector Title */}
                <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2 font-sans">
                  Choose Package Price :
                </h3>

                {/* Vertical Radio Options */}
                <div className="space-y-3.5 mb-8">
                  {plans.map((plan) => {
                    const isSelected = selectedPlanId === plan.id
                    const details = getPlanDetails(plan.name)
                    const colors = getColorClasses(details.color)

                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 select-none group/row ${
                          isSelected
                            ? 'border-[#006CB9] bg-blue-50/40 shadow-md scale-[1.02]'
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          {/* Radio Button UI */}
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected ? 'border-[#006CB9] bg-[#006CB9]' : 'border-gray-300 bg-white group-hover/row:border-gray-400'
                          }`}>
                            <div className={`w-2 h-2 rounded-full bg-white transition-transform ${
                              isSelected ? 'scale-100' : 'scale-0'
                            }`} />
                          </div>

                          <div>
                            <span className="font-extrabold text-gray-900 text-base block group-hover/row:text-[#006CB9] transition-colors">
                              {plan.name}
                            </span>
                            <span className="text-gray-400 text-[11px] block mt-0.5">
                              Akses {plan.durationDays} Hari
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`font-extrabold text-lg ${
                            isSelected ? 'text-[#006CB9]' : 'text-gray-900'
                          } transition-colors`}>
                            {formatPrice(Number(plan.price))}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                {/* Checkout CTA Button */}
                <button
                  onClick={() => selectedPlanId && handleSelectPlan(selectedPlanId)}
                  disabled={!selectedPlanId || isProcessing !== null}
                  className="w-full py-4 bg-[#006CB9] hover:bg-[#005596] text-white font-extrabold rounded-2xl shadow-lg transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2.5 text-base border border-blue-600/10 shadow-blue-500/20"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      <span>Memproses Checkout...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-gray-400 text-center mt-3 leading-normal">
                  Pembayaran aman dan instan didukung oleh Midtrans. Akses langsung aktif setelah transaksi sukses terverifikasi.
                </p>
              </div>

            </div>

          </div>
        )}

        {/* Extra Features Grid Section */}
        <div className="mt-24 relative z-10">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
              Mengapa Memilih E-Paper Radar Kediri?
            </h3>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Seluruh keuntungan premium ini dapat Anda nikmati di setiap pilihan paket langganan kami.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            
            <div className="bg-white rounded-3xl p-6 border border-gray-100 hover:border-gray-200 transition-all shadow-sm hover:shadow-md group">
              <div className="w-12 h-12 bg-blue-50 text-[#006CB9] rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Newspaper className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">E-Paper Harian</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Nikmati salinan digital persis koran cetak Radar Kediri setiap pagi tanpa perlu menunggu pengiriman fisik.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 hover:border-gray-200 transition-all shadow-sm hover:shadow-md group">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Katalog Buku Digital</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Akses eksklusif read-only ke seluruh koleksi buku sejarah, kuliner, pariwisata, dan UMKM khas Kediri secara gratis.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 hover:border-gray-200 transition-all shadow-sm hover:shadow-md group">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Arsip Edisi Lama</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Butuh referensi berita sebelumnya? Cari dan baca kembali seluruh edisi surat kabar digital dari minggu atau bulan lalu.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 hover:border-gray-200 transition-all shadow-sm hover:shadow-md group">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Bebas Iklan & Aman</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Membaca dengan nyaman tanpa gangguan iklan pop-up. Platform dilindungi enkripsi keamanan kelas atas.
              </p>
            </div>

          </div>
        </div>

        {/* FAQ Quick Link */}
        <div className="mt-16 text-center relative z-10">
          <p className="text-gray-500 text-sm mb-3">Butuh bantuan atau memiliki pertanyaan lain mengenai pembayaran?</p>
          <Link 
            href="/faq"
            className="inline-flex items-center gap-1 text-[#006CB9] hover:text-[#005596] hover:underline font-bold text-sm"
          >
            <span>Buka Halaman Hubungi Kami & FAQ</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  )
}
