import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getNotices } from '../hooks/useApi'

export default function Notices() {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getNotices().then(data => {
      setNotices(data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = notices.filter(n =>
    n.title?.toLowerCase().includes(search.toLowerCase()) ||
    n.content?.toLowerCase().includes(search.toLowerCase())
  )

  const pinned = filtered.filter(n => n.is_pinned)
  const regular = filtered.filter(n => !n.is_pinned)

  return (
    <div>
      <div className="bg-gradient-to-br from-college-900 to-college-800 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-blue-300 text-sm mb-3">
            <span>Home</span><span>›</span><span>Notices</span>
          </div>
          <h1 className="font-display text-4xl font-bold mb-2">Notice Board</h1>
          <p className="text-blue-200">Official announcements and college news</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text" placeholder="Search notices..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-college-500 outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-gray-100"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pinned */}
            {pinned.map(n => <NoticeItem key={n.ID} notice={n} />)}
            {/* Regular */}
            {regular.map(n => <NoticeItem key={n.ID} notice={n} />)}
            {filtered.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <div className="text-5xl mb-4">📢</div>
                <p className="text-lg font-medium">No notices found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function NoticeItem({ notice }) {
  const date = new Date(notice.publish_date).toLocaleDateString('en-BD', { day: '2-digit', month: 'long', year: 'numeric' })
  return (
    <Link to={`/notices/${notice.ID}`}
      className={`block bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border group overflow-hidden ${notice.is_pinned ? 'border-red-100' : 'border-gray-100'}`}>
      <div className="flex items-start gap-4 p-5">
        <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl ${notice.is_pinned ? 'bg-red-50' : 'bg-college-50'}`}>
          {notice.is_pinned ? '📌' : '📋'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-gray-900 group-hover:text-college-700 transition text-base">{notice.title}</h3>
            {notice.is_pinned && (
              <span className="shrink-0 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Pinned</span>
            )}
          </div>
          {notice.content && (
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{notice.content}</p>
          )}
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs text-gray-400 flex items-center gap-1">📅 {date}</span>
            {notice.image && <span className="text-xs text-college-600 flex items-center gap-1">🖼 Has attachment</span>}
          </div>
        </div>
        <svg className="w-5 h-5 text-gray-300 group-hover:text-college-500 transition shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}
