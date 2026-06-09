'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Card from './ui/Card'
import { useAuth } from '@/lib/context/AuthContext'

interface EditionCardProps {
  id: string
  title: string
  date: string
  coverImage: string
  price: number
  href?: string
  type?: 'book' | 'newspaper'
  hasAccess?: boolean
}

export default function EditionCard({ 
  id,
  title, 
  date, 
  coverImage, 
  price,
  href,
  type = 'newspaper',
  hasAccess = false
}: EditionCardProps) {
  const { user } = useAuth()
  const parsedDate = new Date(date)
  const formattedDate = isNaN(parsedDate.getTime())
    ? date
    : parsedDate.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)

  // Determine if user has access to this edition
  const hasUserAccess = type === 'newspaper' && (hasAccess || user?.isSubscribed || user?.role === 'admin')
  const accessLabel = user?.role === 'admin' 
    ? 'Akses Admin' 
    : (user?.isSubscribed ? 'Akses Langganan' : 'Sudah Dibeli')

  const CardContent = (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Card className="p-0 overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow duration-300">
        {/* Cover Image - Aspect Ratio 3:4 (vertical) */}
        <div className="aspect-[3/4] relative bg-gray-100 overflow-hidden">
          <Image
            src={coverImage}
            alt={`Cover ${title}`}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
        
        {/* Card Info */}
        <div className="p-4">
          {/* Title */}
          <h3 className={`font-bold line-clamp-2 mb-1 transition-colors ${type === 'book' ? 'group-hover:text-amber-600' : 'group-hover:text-primary'}`}>
            {title}
          </h3>
          
          {/* Date */}
          <p className="text-gray-500 text-xs mb-2">
            {formattedDate}
          </p>
          
          {/* Price or Label */}
          <p className={`font-semibold ${type === 'book' ? 'text-amber-600' : (hasUserAccess ? 'text-green-600' : 'text-primary')}`}>
            {type === 'book' 
              ? 'Baca Digital Gratis' 
              : (hasUserAccess ? accessLabel : formattedPrice)
            }
          </p>
        </div>
      </Card>
    </motion.div>
  )

  // Wrap with Link if href is provided
  if (href) {
    return (
      <Link href={href} className="block">
        {CardContent}
      </Link>
    )
  }

  return CardContent
}
