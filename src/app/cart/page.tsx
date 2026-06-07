'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, CreditCard, ShieldCheck, Newspaper, BookOpen } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import { useAuth } from '@/lib/context/AuthContext'
import toast from 'react-hot-toast'

export default function CartPage() {
  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const { user } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Format harga ke Rupiah
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = 0 // Bisa ditambah fitur kupon
  const total = subtotal - discount

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu untuk melakukan checkout')
      router.push(`/auth/login?redirect=/cart`)
      return
    }

    if (items.length === 0) {
      toast.error('Keranjang Anda kosong')
      return
    }

    setIsCheckingOut(true)
    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          items: items.map(item => ({
            id: item.id,
            type: item.type,
            quantity: item.quantity,
          })),
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
            toast.success('Pembayaran Berhasil!')
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
      toast.error(err.message || 'Terjadi kesalahan saat checkout')
      console.error(err)
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (!mounted) {
    return (
      <main className="min-h-screen bg-gray-50 pt-32 lg:pt-40 pb-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006CB9]"></div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-32 lg:pt-40 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/"
            className="p-2 rounded-xl bg-white border border-gray-200 hover:border-[#006CB9] hover:text-[#006CB9] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Keranjang Belanja</h1>
            <p className="text-gray-500">{items.length} item dalam keranjang</p>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div 
                  key={`${item.type}-${item.id}`}
                  className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 flex gap-4"
                >
                  {/* Cover */}
                  <div className="w-20 md:w-24 aspect-[3/4] relative bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src={item.coverUrl || '/images/newspapers/cover1.jpg'}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {item.type === 'newspaper' ? (
                            <Newspaper className="w-4 h-4 text-[#006CB9]" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-amber-600" />
                          )}
                          <span className="text-xs font-medium text-gray-500 uppercase">
                            {item.type === 'newspaper' ? 'E-Paper' : 'Buku'}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 line-clamp-1">{item.title}</h3>
                        {item.subtitle && <p className="text-sm text-gray-500">{item.subtitle}</p>}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Price & Quantity */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="font-bold text-lg text-[#006CB9]">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-32">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Ringkasan Pesanan</h2>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({items.reduce((sum, i) => sum + i.quantity, 0)} item)</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Diskon</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <hr className="my-3" />
                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-[#006CB9]">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button 
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full mt-6 bg-[#006CB9] hover:bg-[#005596] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-55"
                >
                  <CreditCard className="w-5 h-5" />
                  {isCheckingOut ? 'Memproses...' : 'Bayar Sekarang'}
                </button>

                {/* Trust Badge */}
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  Pembayaran aman & terenkripsi oleh Midtrans
                </div>

                {/* Continue Shopping */}
                <Link 
                  href="/newspapers"
                  className="block mt-4 text-center text-[#006CB9] hover:underline text-sm font-medium"
                >
                  Lanjut Belanja
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Keranjang Kosong</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Belum ada item di keranjang Anda. Yuk jelajahi koleksi koran dan buku digital kami!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Link
                href="/newspapers"
                className="inline-flex items-center justify-center gap-2 bg-[#006CB9] hover:bg-[#005596] text-white font-bold px-6 py-3.5 rounded-xl transition-colors text-sm"
              >
                <Newspaper className="w-5 h-5" />
                Jelajahi E-Paper
              </Link>
              <Link
                href="/books"
                className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3.5 rounded-xl transition-colors text-sm"
              >
                <BookOpen className="w-5 h-5" />
                Jelajahi Buku
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
