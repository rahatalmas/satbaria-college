import { useState, useEffect } from 'react'
import { getStaff } from '../hooks/useApi'

export default function Staff() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStaff().then(data => {
      setStaff(data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="bg-gradient-to-br from-college-900 to-college-800 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-blue-300 text-sm mb-3">
            <span>Home</span><span>›</span><span>Staff</span>
          </div>
          <h1 className="font-display text-4xl font-bold mb-2">College Staff</h1>
          <p className="text-blue-200">Our dedicated administrative and support staff</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-60 animate-pulse border border-gray-100"></div>
            ))}
          </div>
        ) : staff.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {staff.map(s => (
              <div key={s.ID} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-5 text-center">
                <div className="w-16 h-16 rounded-full bg-college-100 flex items-center justify-center mx-auto mb-3">
                  {s.picture ? (
                    <img src={s.picture} alt={s.name} className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <svg className="w-7 h-7 text-college-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                    </svg>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 text-base">{s.name}</h3>
                {s.designation && <p className="text-college-700 text-sm mt-0.5">{s.designation}</p>}
                {s.department && <p className="text-gray-400 text-xs mt-1">{s.department}</p>}
                {s.joined_date && <p className="text-gray-400 text-xs mt-1">Since: {s.joined_date}</p>}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">👥</div>
            <p className="text-lg font-medium">No staff members found</p>
          </div>
        )}
      </div>
    </div>
  )
}
