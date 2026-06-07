'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Card from './ui/Card'

interface EditionCardProps {
  id: string
  title: string
  date: string
  coverImage: string
  price: number
  href?: string
}

export default function EditionCard({ 
  id,
  title, 
  date, 
  coverImage, 
  price,
  href 
}: EditionCardProps) {
  const formattedDate = new Date(date).toLocaleDateString('id-ID', {
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
          <h3 className="font-bold text-gray-900 line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          {/* Date */}
          <p className="text-gray-500 text-xs mb-2">
            {formattedDate}
          </p>
          
          {/* Price */}
          <p className="text-primary font-semibold">
            {formattedPrice}
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
