import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getNotice } from '../hooks/useApi'

export default function NoticeDetail() {
  const { id } = useParams()
  const [notice, setNotice] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNotice(id).then(data => {
      setNotice(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <div className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100"></div>
    </div>
  )

  if (!notice) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-400">
      <div className="text-5xl mb-4">🔍</div>
      <p>Notice not found.</p>
      <Link to="/notices" className="text-college-700 mt-4 inline-block">← Back to Notices</Link>
    </div>
  )

  const date = new Date(notice.publish_date).toLocaleDateString('en-BD', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div>
      <div className="bg-gradient-to-br from-college-900 to-college-800 text-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-blue-300 text-sm mb-3">
            <Link to="/" className="hover:text-white">Home</Link><span>›</span>
            <Link to="/notices" className="hover:text-white">Notices</Link><span>›</span>
            <span className="text-white">Detail</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/notices" className="inline-flex items-center gap-2 text-college-700 hover:text-college-800 text-sm font-medium mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Notices
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {notice.image && (
            <img src={notice.image} alt={notice.title} className="w-full h-64 object-cover" />
          )}
          <div className="p-8">
            {notice.is_pinned && (
              <span className="inline-block bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-medium mb-4">📌 Pinned Notice</span>
            )}
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-4">{notice.title}</h1>
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-6 pb-6 border-b border-gray-100">
              <span>📅 {date}</span>
              <span>•</span>
              <span>Satbaria Degree College</span>
            </div>
            {notice.content && (
              <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {notice.content}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
