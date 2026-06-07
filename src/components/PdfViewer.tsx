'use client'

import { useState } from 'react'
import Button from './ui/Button'

interface PdfViewerProps {
  url: string
  title?: string
}

export default function PdfViewer({ url, title }: PdfViewerProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [scale, setScale] = useState(1)

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Toolbar */}
      <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {title && <h2 className="font-semibold">{title}</h2>}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Page navigation */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
            >
              ←
            </Button>
            <span className="text-sm">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
            >
              →
            </Button>
          </div>
          
          {/* Zoom controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScale(Math.max(0.5, scale - 0.1))}
            >
              −
            </Button>
            <span className="text-sm w-16 text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScale(Math.min(2, scale + 0.1))}
            >
              +
            </Button>
          </div>
        </div>
      </div>
      
      {/* PDF Content */}
      <div className="flex-1 overflow-auto p-4 flex justify-center">
        <div 
          className="bg-white shadow-lg"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
        >
          {/* PDF rendering will be implemented with pdf.js */}
          <iframe
            src={url}
            className="w-full h-full min-h-[800px]"
            title={title}
          />
        </div>
      </div>
    </div>
  )
}
