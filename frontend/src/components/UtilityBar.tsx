export type SortOption = 'recommended' | 'newest' | 'price-low' | 'price-high'

interface UtilityBarProps {
  onFiltersClick: () => void
  sort: SortOption
  onSortChange: (value: SortOption) => void
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
]

export default function UtilityBar({ onFiltersClick, sort, onSortChange }: UtilityBarProps) {
  return (
    <div className="sticky top-14 z-10 h-14 flex items-center justify-between px-6 border-b border-mosaik-gray/20 dark:border-mosaik-dark-border bg-white dark:bg-mosaik-dark-bg">
      <button
        type="button"
        onClick={onFiltersClick}
        className="text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white hover:opacity-60 transition-opacity"
      >
        Filters
      </button>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-widest text-mosaik-gray dark:text-gray-400">Sort</span>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="text-xs font-normal text-mosaik-black dark:text-white bg-transparent border-none outline-none cursor-pointer uppercase tracking-widest appearance-none pr-6"
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
