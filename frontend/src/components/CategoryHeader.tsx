const CATEGORY_MAP: Record<string, { name: string; descriptor: string }> = {
  trousers: { name: 'Trousers', descriptor: 'Timeless cuts for every occasion' },
  shirts: { name: 'Shirts', descriptor: 'Refined essentials for the modern wardrobe' },
  tshirts: { name: 'T-Shirts', descriptor: 'Quality basics in organic cotton' },
  hoodies: { name: 'Hoodies', descriptor: 'Relaxed comfort for everyday wear' },
  jackets: { name: 'Jackets & Coats', descriptor: 'Structured layers for all seasons' },
  jeans: { name: 'Jeans', descriptor: 'Slim and straight fits in premium denim' },
  sweaters: { name: 'Sweaters', descriptor: 'Knit essentials for warmth' },
}

interface CategoryHeaderProps {
  categorySlug: string | null
}

export default function CategoryHeader({ categorySlug }: CategoryHeaderProps) {
  const info = categorySlug ? CATEGORY_MAP[categorySlug] : null
  const displayName = info?.name ?? 'All Products'
  const descriptor = info?.descriptor ?? 'Curated essentials for the modern wardrobe'

  return (
    <header className="h-[150px] flex items-center justify-center bg-white border-b border-mosaik-gray/20">
      <div className="text-center">
        <h1 className="text-xl font-normal text-mosaik-black mb-1">
          {displayName}
        </h1>
        <p className="text-sm font-light text-mosaik-gray">
          {descriptor}
        </p>
      </div>
    </header>
  )
}
