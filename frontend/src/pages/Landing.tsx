import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../types/product'

const PEXELS = (id: number, w = 800, h = 1000) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`

const CATEGORIES = [
  { label: 'Trousers', image: '/images/trousers.png', href: '/shop?cat=trousers' },
  { label: 'Shirts', image: '/images/shirts.png', href: '/shop?cat=shirts' },
  { label: 'T-Shirts', image: '/images/tshirts.png', href: '/shop?cat=tshirts' },
  { label: 'Hoodies', image: '/images/hoodies.png', href: '/shop?cat=hoodies' },
  { label: 'Jackets & Coats', image: '/images/A9C0AFA5-B129-4D89-8EE6-EC5C28086A2E.JPG', href: '/shop?cat=jackets' },
  { label: 'Jeans', image: '/images/jeans.png', href: '/shop?cat=jeans' },
]

const LOOKS = [
  { label: 'Everyday', image: '/images/everyday.png', href: '/shop' },
  { label: 'Tailored Casual', image: PEXELS(4611700, 600, 800), href: '/shop' },
  { label: 'Minimal Street', image: '/images/minimal-street.png', href: '/shop' },
]

const API_URL = 'http://localhost:8080/api/products'

export default function Landing() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.ok ? res.json() : [])
      .then(setProducts)
      .catch(() => setProducts([]))
  }, [])

  const discoverProducts = products.slice(0, 8)
  const [videoMuted, setVideoMuted] = useState(true)

  return (
    <div className="pt-14">
      {/* Hero */}
      <section className="w-full h-[75vh] flex items-center justify-center relative overflow-hidden">
        <img
          src={PEXELS(3748221, 1920, 1080)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-10 max-w-[36ch] text-center px-6">
          <h1 className="text-xl font-normal text-mosaik-black dark:text-white mb-4">
            Clothing designed with intention.
          </h1>
          <p className="text-sm font-light text-mosaik-black/90 dark:text-gray-300">
            Modern silhouettes. Thoughtful materials. Built to last.
          </p>
          <Link
            to="/shop"
            className="inline-block mt-8 text-sm font-normal text-mosaik-black dark:text-white border-b border-mosaik-black dark:border-white pb-1 hover:opacity-60 transition-opacity duration-200"
          >
            Explore the collection
          </Link>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-24 px-6">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map(({ label, image, href }) => (
            <Link
              key={label}
              to={href}
              className="group relative block aspect-[3/4] overflow-hidden"
            >
              <img
                src={image}
                alt={label}
                className="w-full h-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02]"
              />
              <p className="absolute bottom-4 left-4 text-sm font-normal text-mosaik-black dark:text-white group-hover:opacity-100 opacity-90 transition-opacity">
                {label}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Editorial Promotion */}
      <section className="w-full bg-mosaik-gray-soft dark:bg-mosaik-dark-card py-24">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-lg font-normal text-mosaik-black dark:text-white leading-relaxed max-w-[32ch]">
              Two pieces. Thoughtfully paired.
              <br />
              Designed to work together.
            </p>
          </div>
          <div
            className="aspect-[4/5] overflow-hidden cursor-pointer relative group/video"
            onClick={() => setVideoMuted((m) => !m)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setVideoMuted((m) => !m)}
            aria-label={videoMuted ? 'Unmute video' : 'Mute video'}
          >
            <video
              src="/ad.mp4"
              autoPlay
              loop
              muted={videoMuted}
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
              {videoMuted ? (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Lookbook */}
      <section className="py-24 px-6">
        <h2 className="text-sm font-medium text-mosaik-black dark:text-white tracking-[0.2em] uppercase mb-12 text-center">
          Get the Look
        </h2>
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {LOOKS.map(({ label, image, href }) => (
            <Link
              key={label}
              to={href}
              className="flex-shrink-0 w-[280px] group"
            >
              <div className="aspect-[3/4] overflow-hidden mb-4">
                <img
                  src={image}
                  alt={label}
                  className="w-full h-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02]"
                />
              </div>
              <p className="text-sm font-normal text-mosaik-black dark:text-white">{label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Product Discovery */}
      <section className="py-24 px-6 bg-white dark:bg-mosaik-dark-bg">
        <h2 className="text-sm font-medium text-mosaik-black dark:text-white tracking-[0.2em] uppercase mb-12 text-center">
          Discover
        </h2>
        <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide">
          {discoverProducts.length > 0 ? (
            discoverProducts.map((product) => (
              <Link
                key={product.id}
                to={`/shop/${product.id}`}
                className="flex-shrink-0 w-[220px] group"
              >
                <div className="aspect-[2/3] overflow-hidden mb-4">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PEXELS(708440, 440, 660)
                    }}
                  />
                </div>
                <p className="text-sm font-normal text-mosaik-black">{product.name}</p>
                <p className="text-sm font-light text-mosaik-gray dark:text-gray-400 mt-1">${product.price.toFixed(2)}</p>
              </Link>
            ))
          ) : (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <Link key={i} to="/shop" className="flex-shrink-0 w-[220px] group">
                <div className="aspect-[2/3] overflow-hidden mb-4 bg-mosaik-gray-soft dark:bg-mosaik-dark-card">
                  <div className="w-full h-full" />
                </div>
                <p className="text-sm font-normal text-mosaik-black">—</p>
                <p className="text-sm font-light text-mosaik-gray dark:text-gray-400 mt-1">—</p>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 px-6">
        <div className="max-w-[480px] mx-auto text-center">
          <p className="text-sm font-normal text-mosaik-black dark:text-white mb-6">
            Receive updates when new pieces are released.
          </p>
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Email"
              className="flex-1 py-3 px-4 border border-mosaik-gray/50 dark:border-mosaik-dark-border bg-transparent text-sm font-normal text-mosaik-black dark:text-white placeholder:text-mosaik-gray dark:placeholder:text-gray-500 outline-none focus:border-mosaik-black dark:focus:border-white transition-colors duration-200"
            />
            <button
              type="submit"
              className="px-6 py-3 text-sm font-normal text-mosaik-black dark:text-white border border-mosaik-black dark:border-white hover:bg-mosaik-black hover:text-white transition-colors duration-200"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-mosaik-gray/30 dark:border-mosaik-dark-border bg-mosaik-gray-soft dark:bg-mosaik-dark-card py-16 px-6">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-sm font-medium text-mosaik-black dark:text-white mb-4">Customer Support</h3>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-sm font-normal text-mosaik-black dark:text-white hover:opacity-60">Contact</Link></li>
              <li><Link to="/shipping" className="text-sm font-normal text-mosaik-black dark:text-white hover:opacity-60">Shipping</Link></li>
              <li><Link to="/returns" className="text-sm font-normal text-mosaik-black dark:text-white hover:opacity-60">Returns</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-mosaik-black dark:text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm font-normal text-mosaik-black dark:text-white hover:opacity-60">About</Link></li>
              <li><Link to="/careers" className="text-sm font-normal text-mosaik-black dark:text-white hover:opacity-60">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-mosaik-black dark:text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-sm font-normal text-mosaik-black dark:text-white hover:opacity-60">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm font-normal text-mosaik-black dark:text-white hover:opacity-60">Terms</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-mosaik-black dark:text-white mb-4">Follow</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm font-normal text-mosaik-black dark:text-white hover:opacity-60">Instagram</a></li>
              <li><a href="#" className="text-sm font-normal text-mosaik-black dark:text-white hover:opacity-60">Twitter</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
