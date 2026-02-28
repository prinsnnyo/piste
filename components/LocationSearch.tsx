'use client'
import { useState, useRef, useEffect } from 'react'
import { LatLngTuple } from '@/lib/types'

interface SearchResult {
  lat: string
  lon: string
  display_name: string
}

interface LocationSearchProps {
  onLocationSelected: (position: LatLngTuple) => void
}

export function LocationSearch({ onLocationSelected }: LocationSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Close results on click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchLocations = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=8`
      )
      const data = await response.json()
      setResults(data || [])
      setIsOpen(true)
    } catch (error) {
      console.error('Error searching locations:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)

    // Debounce search requests
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      searchLocations(value)
    }, 300)
  }

  const handleSelectLocation = (result: SearchResult) => {
    const position: LatLngTuple = [parseFloat(result.lat), parseFloat(result.lon)]
    onLocationSelected(position)
    setQuery(result.display_name)
    setIsOpen(false)
    setResults([])
  }

  return (
    <div
      ref={searchRef}
      className="absolute top-4 right-4 z-[1000] w-64 sm:w-72 max-w-[calc(100%-2rem)]"
    >
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search locations..."
          className="w-full pl-12 pr-4 py-3 bg-white/50 text-gray-900 backdrop-blur-lg border border-gray-200 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
          onFocus={() => results.length > 0 && setIsOpen(true)}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white/90 backdrop-blur-sm border border-gray-500 rounded-lg shadow-lg max-h-100 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleSelectLocation(result)}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 border-b last:border-b-0 text-sm transition-colors"
            >
              <div className="font-medium text-gray-900 truncate">
                {result.display_name.split(',')[0]}
              </div>
              <div className="text-xs text-gray-500 truncate mt-1">
                {result.display_name}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {isOpen && query && results.length === 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-lg shadow-lg p-4 text-center text-sm text-gray-600">
          No locations found
        </div>
      )}
    </div>
  )
}
