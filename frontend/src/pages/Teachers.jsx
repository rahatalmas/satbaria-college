import { useState, useEffect } from 'react'
import { getTeachers, assetUrl } from '../hooks/useApi'

function TeacherCard({ teacher }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 group">
      <div className="bg-gradient-to-br from-college-800 to-college-900 h-32 flex items-center justify-center relative">
        {teacher.picture ? (
          <img src={assetUrl(teacher.picture)} alt={teacher.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg absolute -bottom-10" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-college-700 border-4 border-white shadow-lg absolute -bottom-10 flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </div>
        )}
      </div>
      <div className="pt-14 pb-5 px-5 text-center">
        <h3 className="font-display font-bold text-gray-900 text-lg leading-tight">{teacher.name}</h3>
        {teacher.designation && (
          <p className="text-college-700 text-sm font-medium mt-1">{teacher.designation}</p>
        )}
        {teacher.subject && (
          <span className="inline-block mt-2 bg-college-50 text-college-800 text-xs px-3 py-1 rounded-full font-medium border border-college-100">
            {teacher.subject}
          </span>
        )}
        {teacher.joined_date && (
          <p className="text-gray-400 text-xs mt-2">Joined: {teacher.joined_date}</p>
        )}
      </div>
    </div>
  )
}

export default function Teachers() {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getTeachers().then(data => {
      setTeachers(data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = teachers.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.subject?.toLowerCase().includes(search.toLowerCase()) ||
    t.designation?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Page Header */}
      <div className="bg-gradient-to-br from-college-900 to-college-800 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-blue-300 text-sm mb-3">
            <span>Home</span><span>›</span><span>Teachers</span>
          </div>
          <h1 className="font-display text-4xl font-bold mb-2">Our Teachers</h1>
          <p className="text-blue-200">Dedicated faculty committed to academic excellence</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search */}
        <div className="mb-8 max-w-md">
          <div className="relative">
            <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, subject..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-college-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-60 animate-pulse border border-gray-100"></div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <>
            <p className="text-sm text-gray-500 mb-6">Showing {filtered.length} teacher{filtered.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map(t => <TeacherCard key={t.ID} teacher={t} />)}
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">👨‍🏫</div>
            <p className="text-lg font-medium">No teachers found</p>
            <p className="text-sm mt-1">{search ? 'Try a different search term' : 'No teachers added yet'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
