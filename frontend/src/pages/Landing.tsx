import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../types/product'

const CATEGORIES = [
  { label: 'Trousers', image: 'https://picsum.photos/seed/trousers/800/1000', href: '/shop?cat=trousers' },
  { label: 'Shirts', image: 'https://picsum.photos/seed/shirts/800/1000', href: '/shop?cat=shirts' },
  { label: 'T-Shirts', image: 'https://picsum.photos/seed/tshirts/800/1000', href: '/shop?cat=tshirts' },
  { label: 'Knitwear', image: 'https://picsum.photos/seed/knitwear/800/1000', href: '/shop?cat=knitwear' },
  { label: 'Jackets & Coats', image: 'https://picsum.photos/seed/jackets/800/1000', href: '/shop?cat=jackets' },
  { label: 'Footwear', image: 'https://picsum.photos/seed/footwear/800/1000', href: '/shop?cat=footwear' },
]

const LOOKS = [
  { label: 'Everyday', image: 'https://picsum.photos/seed/look1/600/800', href: '/shop' },
  { label: 'Tailored Casual', image: 'https://picsum.photos/seed/look2/600/800', href: '/shop' },
  { label: 'Minimal Street', image: 'https://picsum.photos/seed/look3/600/800', href: '/shop' },
  { label: 'Refined Essentials', image: 'https://picsum.photos/seed/look4/600/800', href: '/shop' },
]

const MEDIA_STRIP = [
  'https://picsum.photos/seed/m1/400/400',
  'https://picsum.photos/seed/m2/400/400',
  'https://picsum.photos/seed/m3/400/400',
  'https://picsum.photos/seed/m4/400/400',
  'https://picsum.photos/seed/m5/400/400',
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

  return (
    <div className="pt-14">
      {/* Hero */}
      <section className="w-full h-[75vh] flex items-center justify-center relative overflow-hidden">
        <img
          src="https://picsum.photos/seed/hero/1920/1080"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-10 max-w-[36ch] text-center px-6">
          <h1 className="text-xl font-normal text-mosaik-black mb-4">
            Clothing designed with intention.
          </h1>
          <p className="text-sm font-light text-mosaik-black/90">
            Modern silhouettes. Thoughtful materials. Built to last.
          </p>
          <Link
            to="/shop"
            className="inline-block mt-8 text-sm font-normal text-mosaik-black border-b border-mosaik-black pb-1 hover:opacity-60 transition-opacity duration-200"
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
              <p className="absolute bottom-4 left-4 text-sm font-normal text-mosaik-black group-hover:opacity-100 opacity-90 transition-opacity">
                {label}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Editorial Promotion */}
      <section className="w-full bg-mosaik-gray-soft py-24">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-lg font-normal text-mosaik-black leading-relaxed max-w-[32ch]">
              Two pieces. Thoughtfully paired.
              <br />
              Designed to work together.
            </p>
          </div>
          <div className="aspect-[4/5] overflow-hidden">
            <img
              src="https://picsum.photos/seed/editorial/800/1000"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Lookbook */}
      <section className="py-24 px-6">
        <h2 className="text-sm font-medium text-mosaik-black tracking-[0.2em] uppercase mb-12 text-center">
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
              <p className="text-sm font-normal text-mosaik-black">{label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Product Discovery */}
      <section className="py-24 px-6 bg-white">
        <h2 className="text-sm font-medium text-mosaik-black tracking-[0.2em] uppercase mb-12 text-center">
          Discover
        </h2>
        <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide">
          {discoverProducts.length > 0 ? (
            discoverProducts.map((product) => (
              <Link
                key={product.id}
                to="/shop"
                className="flex-shrink-0 w-[220px] group"
              >
                <div className="aspect-[2/3] overflow-hidden mb-4">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/placeholder/440/660'
                    }}
                  />
                </div>
                <p className="text-sm font-normal text-mosaik-black">{product.name}</p>
                <p className="text-sm font-light text-mosaik-gray mt-1">${product.price.toFixed(2)}</p>
              </Link>
            ))
          ) : (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <Link key={i} to="/shop" className="flex-shrink-0 w-[220px] group">
                <div className="aspect-[2/3] overflow-hidden mb-4 bg-mosaik-gray-soft">
                  <div className="w-full h-full" />
                </div>
                <p className="text-sm font-normal text-mosaik-black">—</p>
                <p className="text-sm font-light text-mosaik-gray mt-1">—</p>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Media Strip */}
      <section className="py-16 overflow-hidden">
        <div className="flex gap-2">
          {MEDIA_STRIP.map((src, i) => (
            <div key={i} className="flex-shrink-0 w-[300px] md:w-[400px] aspect-square overflow-hidden">
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 px-6">
        <div className="max-w-[480px] mx-auto text-center">
          <p className="text-sm font-normal text-mosaik-black mb-6">
            Receive updates when new pieces are released.
          </p>
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Email"
              className="flex-1 py-3 px-4 border border-mosaik-gray/50 bg-transparent text-sm font-normal text-mosaik-black placeholder:text-mosaik-gray outline-none focus:border-mosaik-black transition-colors duration-200"
            />
            <button
              type="submit"
              className="px-6 py-3 text-sm font-normal text-mosaik-black border border-mosaik-black hover:bg-mosaik-black hover:text-white transition-colors duration-200"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-mosaik-gray/30 bg-mosaik-gray-soft py-16 px-6">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-sm font-medium text-mosaik-black mb-4">Customer Support</h3>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-sm font-normal text-mosaik-black hover:opacity-60">Contact</Link></li>
              <li><Link to="/shipping" className="text-sm font-normal text-mosaik-black hover:opacity-60">Shipping</Link></li>
              <li><Link to="/returns" className="text-sm font-normal text-mosaik-black hover:opacity-60">Returns</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-mosaik-black mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm font-normal text-mosaik-black hover:opacity-60">About</Link></li>
              <li><Link to="/careers" className="text-sm font-normal text-mosaik-black hover:opacity-60">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-mosaik-black mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-sm font-normal text-mosaik-black hover:opacity-60">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm font-normal text-mosaik-black hover:opacity-60">Terms</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-mosaik-black mb-4">Follow</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm font-normal text-mosaik-black hover:opacity-60">Instagram</a></li>
              <li><a href="#" className="text-sm font-normal text-mosaik-black hover:opacity-60">Twitter</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
