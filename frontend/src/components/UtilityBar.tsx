export type SortOption = 'recommended' | 'newest' | 'price-low'

interface UtilityBarProps {
  onFiltersClick: () => void
  sort: SortOption
  onSortChange: (value: SortOption) => void
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price Low/High' },
]

export default function UtilityBar({ onFiltersClick, sort, onSortChange }: UtilityBarProps) {
  return (
    <div className="h-14 flex items-center justify-between px-6 border-b border-mosaik-gray/20 bg-white">
      <button
        type="button"
        onClick={onFiltersClick}
        className="text-xs font-medium uppercase tracking-widest text-mosaik-black hover:opacity-60 transition-opacity"
      >
        Filters
      </button>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-widest text-mosaik-gray">Sort</span>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="text-xs font-normal text-mosaik-black bg-transparent border-none outline-none cursor-pointer uppercase tracking-widest appearance-none pr-6"
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
