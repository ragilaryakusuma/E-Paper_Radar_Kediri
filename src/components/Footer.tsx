import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <Image
              src="/images/logo.png"
              alt="Radar Kediri logo"
              width={180}
              height={180}
              className="object-contain"
              />
            </div>
            <p className="text-gray-400 text-sm"></p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Navigasi</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/newspapers" className="hover:text-white">Koran</Link></li>
              <li><Link href="/subscription" className="hover:text-white">Berlangganan</Link></li>
              <li><Link href="/library" className="hover:text-white">Perpustakaan</Link></li>
                <li><a href="https://rprojectevent.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white">Acara</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Akun</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/auth/login" className="hover:text-white">Masuk</Link></li>
              <li><Link href="/auth/register" className="hover:text-white">Daftar</Link></li>
              <li><Link href="/cart" className="hover:text-white">Keranjang</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Kontak</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Email: info@radarkediri.id</li>
              <li>Whatsapp: 0851-6862-4015</li>
              <li>Kediri, Jawa Timur</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Website developed by Ragil Arya Kusuma - Web Developer Intern Radar Kediri.</p>
        </div>
      </div>
    </footer>
  )
}
