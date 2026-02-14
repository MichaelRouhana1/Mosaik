export interface FilterState {
  priceMin: number
  priceMax: number
  size: string[]
  color: string[]
}

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL']
const COLOR_OPTIONS = ['Black', 'White', 'Indigo', 'Charcoal', 'Camel', 'Navy', 'Grey', 'Blue', 'Light Blue']

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  priceBounds: { min: number; max: number }
}

function FilterSection({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div className="mb-8">
      <h3 className="text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white mb-4">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={`rounded-none px-4 py-2 text-xs font-normal uppercase tracking-widest transition-colors ${
              selected.includes(opt)
                ? 'bg-mosaik-black text-white dark:bg-white dark:text-mosaik-black'
                : 'bg-mosaik-gray-soft dark:bg-mosaik-dark-border text-mosaik-black dark:text-white hover:bg-mosaik-gray/30 dark:hover:bg-mosaik-dark-border/80'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function PriceRangeSection({
  bounds,
  valueMin,
  valueMax,
  onChange,
}: {
  bounds: { min: number; max: number }
  valueMin: number
  valueMax: number
  onChange: (min: number, max: number) => void
}) {
  const range = bounds.max - bounds.min || 1
  const step = Math.max(0.01, range / 100)
  const clampedMin = Math.max(bounds.min, Math.min(bounds.max, valueMin))
  const clampedMax = Math.max(bounds.min, Math.min(bounds.max, valueMax))

  return (
    <div className="mb-8">
      <h3 className="text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white mb-4">
        Price Range
      </h3>
      <div className="space-y-6">
        <div>
          <label className="text-xs text-mosaik-gray dark:text-gray-400 block mb-2">Min: ${clampedMin.toFixed(0)}</label>
          <input
            type="range"
            min={bounds.min}
            max={bounds.max}
            step={step}
            value={clampedMin}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              onChange(v, Math.max(v, clampedMax))
            }}
            className="w-full h-1.5 bg-mosaik-gray/30 dark:bg-mosaik-dark-border appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:bg-mosaik-black [&::-webkit-slider-thumb]:dark:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:-mt-1.5"
          />
        </div>
        <div>
          <label className="text-xs text-mosaik-gray dark:text-gray-400 block mb-2">Max: ${clampedMax.toFixed(0)}</label>
          <input
            type="range"
            min={bounds.min}
            max={bounds.max}
            step={step}
            value={clampedMax}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              onChange(Math.min(v, clampedMin), v)
            }}
            className="w-full h-1.5 bg-mosaik-gray/30 dark:bg-mosaik-dark-border appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:bg-mosaik-black [&::-webkit-slider-thumb]:dark:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:-mt-1.5"
          />
        </div>
      </div>
    </div>
  )
}

export default function FilterPanel({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  priceBounds,
}: FilterPanelProps) {
  const toggleFilter = (key: 'size' | 'color') => (value: string) => {
    const current = filters[key]
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    onFiltersChange({ ...filters, [key]: next })
  }

  const setPriceRange = (priceMin: number, priceMax: number) => {
    onFiltersChange({ ...filters, priceMin, priceMax })
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`fixed left-0 top-0 bottom-0 w-[320px] max-w-[85vw] z-50 bg-white dark:bg-mosaik-dark-card shadow-xl overflow-y-auto transition-transform duration-200 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 pt-16">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 text-mosaik-black dark:text-white hover:opacity-60"
            aria-label="Close filters"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-sm font-medium uppercase tracking-widest text-mosaik-black dark:text-white mb-8">
            Filters
          </h2>
          <PriceRangeSection
            bounds={priceBounds}
            valueMin={filters.priceMin}
            valueMax={filters.priceMax}
            onChange={setPriceRange}
          />
          <FilterSection
            title="Size"
            options={SIZE_OPTIONS}
            selected={filters.size}
            onToggle={toggleFilter('size')}
          />
          <FilterSection
            title="Color"
            options={COLOR_OPTIONS}
            selected={filters.color}
            onToggle={toggleFilter('color')}
          />
        </div>
      </aside>
    </>
  )
}
