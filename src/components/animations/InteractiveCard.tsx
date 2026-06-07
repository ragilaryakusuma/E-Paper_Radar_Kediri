'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface InteractiveCardProps {
  children: ReactNode
  className?: string
  hoverScale?: number
  tapScale?: number
  hoverY?: number
}

export default function InteractiveCard({
  children,
  className = '',
  hoverScale = 1.02,
  tapScale = 0.98,
  hoverY = -5,
}: InteractiveCardProps) {
  return (
    <motion.div
      whileHover={{ 
        scale: hoverScale, 
        y: hoverY,
        transition: { duration: 0.2, ease: 'easeOut' }
      }}
      whileTap={{ 
        scale: tapScale,
        transition: { duration: 0.1 }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
