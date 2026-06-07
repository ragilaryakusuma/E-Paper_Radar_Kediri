'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { CheckCircle, AlertTriangle, XCircle, Library, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'

import { Suspense } from 'react'

function PaymentStatusContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { clearCart } = useCartStore()
  
  const status = params.status as string // success, pending, error
  const orderId = searchParams.get('order_id')

  useEffect(() => {
    if (status === 'success') {
      clearCart()
    }
  }, [status, clearCart])

  const renderStatus = () => {
    switch (status) {
      case 'success':
        return (
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full text-green-600 mx-auto animate-bounce">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 font-sans">Pembayaran Berhasil!</h1>
            <p className="text-gray-600 max-w-md mx-auto text-sm">
              Terima kasih! Pembayaran Anda telah kami terima dengan sukses. Koran digital yang Anda beli sudah tersedia di akun Anda.
              {orderId && <span className="block mt-2 font-mono text-sm font-semibold text-gray-500">Order ID: {orderId}</span>}
            </p>
            <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/library"
                className="inline-flex items-center justify-center gap-2 bg-[#006CB9] hover:bg-[#005596] text-white font-bold px-6 py-3.5 rounded-xl shadow-lg transition-colors text-sm"
              >
                <Library className="w-5 h-5" />
                Mulai Membaca (My Library)
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-6 py-3.5 rounded-xl transition-colors text-sm"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        )
      case 'pending':
        return (
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full text-amber-500 mx-auto animate-pulse">
              <AlertTriangle className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 font-sans">Pembayaran Pending</h1>
            <p className="text-gray-600 max-w-md mx-auto text-sm">
              Transaksi Anda sedang diproses. Harap selesaikan pembayaran Anda melalui metode yang Anda pilih di aplikasi/situs Midtrans.
              {orderId && <span className="block mt-2 font-mono text-sm font-semibold text-gray-500">Order ID: {orderId}</span>}
            </p>
            <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-[#006CB9] hover:bg-[#005596] text-white font-bold px-6 py-3.5 rounded-xl shadow-lg transition-colors text-sm"
              >
                Ke Halaman Utama
              </Link>
            </div>
          </div>
        )
      case 'error':
      default:
        return (
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full text-red-600 mx-auto">
              <XCircle className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 font-sans">Pembayaran Gagal</h1>
            <p className="text-gray-600 max-w-md mx-auto text-sm">
              Terjadi kesalahan atau transaksi Anda telah dibatalkan. Silakan periksa kembali detail transaksi atau coba lagi nanti.
            </p>
            <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/cart"
                className="inline-flex items-center justify-center gap-2 bg-[#006CB9] hover:bg-[#005596] text-white font-bold px-6 py-3.5 rounded-xl shadow-lg transition-colors text-sm"
              >
                <ShoppingCart className="w-5 h-5" />
                Kembali ke Keranjang
              </Link>
            </div>
          </div>
        )
    }
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-gray-50 pt-32 pb-16">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100">
          {renderStatus()}
        </div>
      </div>
    </main>
  )
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={
      <main className="min-h-[80vh] flex items-center justify-center bg-gray-50 pt-32 pb-16">
        <div className="max-w-md w-full mx-auto px-4 text-center">
          <div className="w-10 h-10 border-4 border-[#006CB9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Memuat status pembayaran...</p>
        </div>
      </main>
    }>
      <PaymentStatusContent />
    </Suspense>
  )
}
