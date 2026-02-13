import { Link } from 'react-router-dom'

export default function Editorial() {
  return (
    <div className="pt-14 min-h-screen flex items-center justify-center">
      <div className="text-center max-w-[32ch] px-6">
        <h1 className="text-xl font-normal text-mosaik-black dark:text-white mb-4">Editorial</h1>
        <p className="text-sm font-light text-mosaik-black/90 dark:text-gray-300 mb-8">
          Stories, looks, and inspiration. Coming soon.
        </p>
        <Link to="/" className="text-sm font-normal text-mosaik-black dark:text-white border-b border-mosaik-black dark:border-white pb-1 hover:opacity-60">
          Back to home
        </Link>
      </div>
    </div>
  )
}
