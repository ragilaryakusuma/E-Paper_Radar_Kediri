'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, Star, Zap, Crown, Newspaper, BookOpen, Calendar, Gift, ArrowRight } from 'lucide-react'
import { useAuth } from '@/lib/context/AuthContext'
import toast from 'react-hot-toast'

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
      case 'harian':
        return {
          icon: Zap,
          color: 'blue',
          popular: false,
          features: [
            'Akses e-paper selama 24 jam',
            'Baca di 1 perangkat',
            'Kualitas HD & responsif',
            'Dukungan online 24/7'
          ]
        }
      case 'mingguan':
        return {
          icon: Newspaper,
          color: 'blue',
          popular: false,
          features: [
            'Akses e-paper selama 7 hari',
            'Baca di 2 perangkat',
            'Kualitas HD & responsif',
            'Arsip e-paper 7 hari terakhir',
            'Dukungan online 24/7'
          ]
        }
      case 'bulanan':
        return {
          icon: Star,
          color: 'primary',
          popular: true,
          features: [
            'Akses e-paper selama 30 hari',
            'Baca di 3 perangkat sekaligus',
            'Kualitas HD & download offline',
            'Akses semua arsip e-paper',
            'Bebas iklan & prioritas rilis',
            'Dukungan prioritas'
          ]
        }
      case 'tahunan':
        return {
          icon: Crown,
          color: 'amber',
          popular: false,
          features: [
            'Akses e-paper selama 365 hari',
            'Hemat lebih dari 15%!',
            'Baca di 5 perangkat sekaligus',
            'Kualitas HD & download offline',
            'Akses penuh semua arsip & buku',
            'Bebas iklan & prioritas rilis',
            'Dukungan prioritas 24/7'
          ]
        }
      default:
        return {
          icon: Star,
          color: 'blue',
          popular: false,
          features: [
            'Akses penuh e-paper',
            'Baca di berbagai perangkat',
            'Kualitas HD',
            'Dukungan online'
          ]
        }
    }
  }

  const getColorClasses = (color: string, popular?: boolean) => {
    if (popular) {
      return {
        bg: 'bg-[#006CB9]',
        bgLight: 'bg-[#006CB9]/10',
        text: 'text-[#006CB9]',
        border: 'border-[#006CB9]',
        button: 'bg-[#006CB9] hover:bg-[#005596] text-white',
      }
    }
    switch (color) {
      case 'amber':
        return {
          bg: 'bg-amber-500',
          bgLight: 'bg-amber-50',
          text: 'text-amber-600',
          border: 'border-amber-200',
          button: 'bg-amber-500 hover:bg-amber-600 text-white',
        }
      default:
        return {
          bg: 'bg-blue-500',
          bgLight: 'bg-blue-50',
          text: 'text-blue-600',
          border: 'border-gray-200',
          button: 'bg-gray-900 hover:bg-gray-800 text-white',
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
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-32 lg:pt-40 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-[#006CB9]/10 text-[#006CB9] font-semibold px-4 py-2 rounded-full text-sm mb-4">
            <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
            Akses Digital Premium
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 font-sans">
            Pilih Paket Langganan
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-base">
            Nikmati akses tak terbatas ke E-Paper dan koleksi buku digital Radar Kediri. 
            Baca kapan saja, di mana saja.
          </p>
        </div>

        {/* Plans Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006CB9]"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto items-stretch">
            {plans.map((plan) => {
              const details = getPlanDetails(plan.name)
              const colors = getColorClasses(details.color, details.popular)
              const Icon = details.icon

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-3xl p-6 border-2 transition-all hover:shadow-xl flex flex-col justify-between ${
                    details.popular 
                      ? 'border-[#006CB9] shadow-lg scale-105 z-10' 
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {/* Popular Badge */}
                  {details.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-[#006CB9] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                        Paling Populer
                      </span>
                    </div>
                  )}

                  <div>
                    {/* Icon & Name */}
                    <div className={`inline-flex items-center justify-center w-12 h-12 ${colors.bgLight} rounded-2xl mb-4`}>
                      <Icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                    <p className="text-gray-500 text-xs mb-4">{plan.description || `Paket langganan e-paper ${plan.name.toLowerCase()}`}</p>

                    {/* Price */}
                    <div className="mb-6">
                      <span className="text-3xl font-bold text-gray-900">{formatPrice(Number(plan.price))}</span>
                      <span className="text-gray-500 text-sm">/{plan.durationDays} hari</span>
                    </div>
                  </div>

                  <div>
                    {/* CTA Button */}
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={isProcessing !== null}
                      className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm ${colors.button} shadow-md disabled:opacity-55`}
                    >
                      {isProcessing === plan.id ? 'Memproses...' : 'Pilih Paket'}
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* Features */}
                    <ul className="mt-6 space-y-2.5">
                      {details.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className={`w-4 h-4 ${colors.bgLight} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <Check className={`w-2.5 h-2.5 ${colors.text}`} />
                          </div>
                          <span className="text-gray-600 text-xs">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Features Section */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Semua Paket Termasuk
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Newspaper className="w-6 h-6 text-[#006CB9]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">E-Paper Harian</h3>
              <p className="text-sm text-gray-500">Baca koran digital setiap hari</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Buku Digital</h3>
              <p className="text-sm text-gray-500">Koleksi buku lokal terlengkap</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Arsip Lengkap</h3>
              <p className="text-sm text-gray-500">Akses edisi-edisi sebelumnya</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center shadow-sm">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Gift className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Bonus Eksklusif</h3>
              <p className="text-sm text-gray-500">Promo & konten spesial</p>
            </div>
          </div>
        </div>

        {/* FAQ CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">Punya pertanyaan tentang langganan?</p>
          <Link 
            href="/faq"
            className="text-[#006CB9] hover:underline font-semibold"
          >
            Lihat FAQ →
          </Link>
        </div>
      </div>
    </main>
  )
}
