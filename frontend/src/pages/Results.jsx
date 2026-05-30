import { useState, useEffect } from 'react'
import { getResults, getClasses, getGroups } from '../hooks/useApi'

export default function Results() {
  const [results, setResults] = useState([])
  const [classes, setClasses] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ class: '', group: '' })

  useEffect(() => {
    getClasses().then(setClasses)
    getGroups().then(setGroups)
  }, [])

  useEffect(() => {
    getResults(filters).then(data => {
      setResults(data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [filters])

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }))

  return (
    <div>
      <div className="bg-gradient-to-br from-college-900 to-college-800 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-blue-300 text-sm mb-3">
            <span>Home</span><span>›</span><span>Results</span>
          </div>
          <h1 className="font-display text-4xl font-bold mb-2">Exam Results</h1>
          <p className="text-blue-200">Download official result sheets</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <select
            value={filters.class}
            onChange={e => setFilter('class', e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-college-500 outline-none bg-white"
          >
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.ID} value={c.name}>Class {c.name}</option>)}
          </select>
          <select
            value={filters.group}
            onChange={e => setFilter('group', e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-college-500 outline-none bg-white"
          >
            <option value="">All Groups</option>
            {groups.map(g => <option key={g.ID} value={g.name}>{g.name}</option>)}
          </select>
          <button
            onClick={() => setFilters({ class: '', group: '' })}
            className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition"
          >
            Reset
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-gray-100"></div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            {results.map(result => (
              <div key={result.ID} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-college-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                  📄
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-base">{result.title}</h3>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {result.class && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Class {result.class}</span>}
                    {result.group && <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{result.group}</span>}
                    {result.session && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Session: {result.session}</span>}
                    {result.exam_year && <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">Year: {result.exam_year}</span>}
                  </div>
                </div>
                {result.file_path && (
                  <a
                    href={result.file_path}
                    download
                    className="shrink-0 flex items-center gap-2 bg-college-700 hover:bg-college-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">📊</div>
            <p className="text-lg font-medium">No results found</p>
            <p className="text-sm mt-1">Try adjusting the filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
