export interface FilterState {
  fit: string[]
  fabric: string[]
  color: string[]
  length: string[]
}

const FIT_OPTIONS = ['Slim', 'Regular', 'Relaxed', 'Oversized']
const FABRIC_OPTIONS = ['Cotton', 'Wool', 'Denim', 'Leather', 'Fleece']
const COLOR_OPTIONS = ['Black', 'White', 'Indigo', 'Charcoal', 'Camel', 'Navy', 'Grey']
const LENGTH_OPTIONS = ['Cropped', 'Standard', 'Long']

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
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
                ? 'bg-mosaik-black text-white'
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

export default function FilterPanel({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
}: FilterPanelProps) {
  const toggleFilter = (key: keyof FilterState) => (value: string) => {
    const current = filters[key]
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    onFiltersChange({ ...filters, [key]: next })
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
          <FilterSection
            title="Fit"
            options={FIT_OPTIONS}
            selected={filters.fit}
            onToggle={toggleFilter('fit')}
          />
          <FilterSection
            title="Fabric"
            options={FABRIC_OPTIONS}
            selected={filters.fabric}
            onToggle={toggleFilter('fabric')}
          />
          <FilterSection
            title="Color"
            options={COLOR_OPTIONS}
            selected={filters.color}
            onToggle={toggleFilter('color')}
          />
          <FilterSection
            title="Length"
            options={LENGTH_OPTIONS}
            selected={filters.length}
            onToggle={toggleFilter('length')}
          />
        </div>
      </aside>
    </>
  )
}
