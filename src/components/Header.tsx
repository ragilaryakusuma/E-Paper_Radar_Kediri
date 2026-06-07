'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import { 
  Search, 
  Newspaper, 
  Book, 
  JournalRichtext, 
  Collection,
  Cart3,
  List,
  XLg,
  PersonCircle
} from 'react-bootstrap-icons'

import { useCartStore } from '@/lib/store/cartStore'
import { useEffect } from 'react'

// Menu items configuration
const menuItems = [
  { icon: Newspaper, label: 'Newspapers', href: '/newspapers' },
  { icon: Book, label: 'Books', href: '/books' },
  { icon: Collection, label: 'My Library', href: '/library' },
  { icon: JournalRichtext, label: 'Events', href: 'https://rprojectevent.com/' }
]

export default function Header() {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const items = useCartStore((state) => state.items)
  const [cartItemCount, setCartItemCount] = useState(0)

  useEffect(() => {
    setCartItemCount(items.reduce((total, item) => total + item.quantity, 0))
  }, [items])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#006CB9] font-sans">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-3">
        <div className="flex items-center justify-between py-1 gap-3">
          {/* Logo - Left */}
          <Link href="/" className="flex-shrink-0">
            <Image 
              src="/images/logo.png" 
              alt="Radar Kediri" 
              width={300} 
              height={120}
              className="h-20 md:h-24 w-auto"
              priority
            />
          </Link>

          {/* Search Bar - Center (Hidden on mobile) */}
          <form 
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xs lg:max-w-sm mx-4"
          >
            <div className="relative w-full">
              <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search newspapers, books..."
              className="w-full pl-10 pr-4 py-2.5 rounded-md bg-[#005596] text-white placeholder-white/60 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-[#004a80] transition-all text-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-3.5 h-3.5" />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Login/User Info - Desktop */}
            {user ? (
              <div className="hidden lg:flex items-center gap-3 text-white">
                <span className="text-sm font-medium">Hai, {user.name}</span>
                <button 
                  onClick={logout}
                  className="text-white/80 hover:text-white transition-colors text-sm font-medium border border-white/20 hover:border-white px-3 py-1 rounded-full"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                href="/auth/login"
                className="hidden lg:flex items-center gap-1.5 text-white/90 hover:text-white transition-colors px-2 py-1"
              >
                <PersonCircle className="w-5 h-5" />
                <span className="font-medium text-sm">Login</span>
              </Link>
            )}

            {/* Subscribe Button */}
            <Link href="/subscription" className="hidden sm:block">
              <button className="bg-[#F7941D] hover:bg-[#e8850f] text-white font-bold px-5 py-2 rounded-full transition-all hover:shadow-lg text-sm whitespace-nowrap">
                Berlangganan
              </button>
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Tutup menu' : 'Buka menu'}
            >
              {isMenuOpen ? (
                <XLg className="w-5 h-5" />
              ) : (
                <List className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Bar - Desktop */}
      <nav className="hidden md:block bg-[#005596]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-1.5">
            {/* Menu Items - Left */}
            <ul className="flex items-center gap-1">
              {menuItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-all text-sm font-medium"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Cart Button - Right */}
            <Link 
              href="/cart"
              className="flex items-center gap-2 bg-[#004e8a] hover:bg-[#003d6d] px-4 py-2 rounded-full text-white transition-all text-sm font-medium"
            >
              <Cart3 className="w-4 h-4" />
              <span>Cart</span>
              {cartItemCount > 0 && (
                <span className="bg-[#F7941D] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden bg-[#005596] overflow-hidden transition-all duration-300 ${
          isMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
          {/* Mobile Search */}
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search newspapers, books..."
                className="w-full pl-11 pr-4 py-3 rounded-md bg-[#004a80] text-white placeholder-white/60 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 w-4 h-4" />
            </div>
          </form>

          {/* Menu Items */}
          <nav className="space-y-1 pt-2">
            {menuItems.map((item) => (
              <Link 
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 text-white hover:bg-white/10 px-4 py-3 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}

            {/* Cart */}
            <Link 
              href="/cart"
              className="flex items-center gap-3 text-white hover:bg-white/10 px-4 py-3 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Cart3 className="w-5 h-5" />
              <span className="font-medium">Cart</span>
              {cartItemCount > 0 && (
                <span className="bg-[#F7941D] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ml-auto">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Divider */}
          <div className="border-t border-white/10 my-3" />

          {/* Login & Subscribe */}
          <div className="space-y-3">
            {user ? (
              <>
                <div className="px-4 text-white text-sm">
                  Masuk sebagai <strong className="block text-base">{user.name}</strong>
                </div>
                <button 
                  onClick={() => {
                    logout()
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center gap-3 w-full text-left text-red-200 hover:bg-white/10 px-4 py-3 rounded-md transition-colors font-medium"
                >
                  <PersonCircle className="w-5 h-5 text-red-300" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link 
                href="/auth/login"
                className="flex items-center gap-3 text-white hover:bg-white/10 px-4 py-3 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <PersonCircle className="w-5 h-5" />
                <span className="font-medium font-sans">Login</span>
              </Link>
            )}

            <Link 
              href="/subscription"
              onClick={() => setIsMenuOpen(false)}
              className="block"
            >
              <button className="w-full bg-[#F7941D] hover:bg-[#e8850f] text-white font-bold px-6 py-3 rounded-full transition-all">
                Berlangganan
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
