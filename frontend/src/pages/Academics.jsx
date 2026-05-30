import { useState, useEffect } from 'react'
import { getStudentSummary, getClasses, getGroups } from '../hooks/useApi'
const GROUP_INFO = {
  'Science': { icon: '🔬', color: 'from-blue-600 to-blue-800', light: 'bg-blue-50 border-blue-100 text-blue-800', subjects: ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'ICT'] },
  'Business Studies': { icon: '📈', color: 'from-green-600 to-green-800', light: 'bg-green-50 border-green-100 text-green-800', subjects: ['Accounting', 'Finance', 'Marketing', 'Management', 'Economics'] },
  'Humanities': { icon: '📖', color: 'from-purple-600 to-purple-800', light: 'bg-purple-50 border-purple-100 text-purple-800', subjects: ['Bangla', 'English', 'History', 'Civics', 'Economics'] },
}

export default function Academics() {
  const [summaries, setSummaries] = useState([])
  const [classes, setClasses] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState('XI')

  useEffect(() => {
    Promise.all([
      getStudentSummary(),
      getClasses(),
      getGroups()
    ]).then(([summaryData, classData, groupData]) => {
      setSummaries(summaryData || [])
      setClasses(classData || [])
      setGroups(groupData || [])
      if (classData && classData.length > 0 && !classData.some(c => c.name === selectedClass)) {
        setSelectedClass(classData[0].name)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = summaries.filter(s => s.class?.name === selectedClass)
  const sessions = [...new Set(summaries.map(s => s.session))].sort().reverse()
  const latestSession = sessions[0] || '2024-25'
  const latestData = filtered.filter(s => s.session === latestSession)

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-college-900 to-college-800 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-blue-300 text-sm mb-3">
            <span>Home</span><span>›</span><span>Academics</span>
          </div>
          <h1 className="font-display text-4xl font-bold mb-2">Academics</h1>
          <p className="text-blue-200">Explore our academic programs and student statistics</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Academic Groups */}
        <div className="mb-14">
          <h2 className="section-title text-2xl mb-2">Academic Groups</h2>
          <p className="text-gray-400 text-sm mb-8">We offer multiple academic groups under our programs</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {groups.filter(g => g.is_active).map(group => {
              const info = GROUP_INFO[group.name] || { icon: '📚', color: 'from-gray-600 to-gray-800', light: 'bg-gray-50 border-gray-100 text-gray-800', subjects: ['General Studies'] }
              return (
                <div key={group.ID} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <div className={`bg-gradient-to-br ${info.color} text-white p-6`}>
                    <div className="text-4xl mb-3">{info.icon}</div>
                    <h3 className="font-display text-xl font-bold">{group.name}</h3>
                    <p className="text-white/70 text-sm mt-1">{group.class?.name || 'HSC'} Level</p>
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Key Subjects</p>
                    <div className="flex flex-wrap gap-2">
                      {(info.subjects || []).map(sub => (
                        <span key={sub} className={`text-xs px-2.5 py-1 rounded-full border font-medium ${info.light}`}>
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Student Summary */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="section-title text-2xl mb-1">Student Summary</h2>
              <p className="text-gray-400 text-sm">Enrollment statistics by class and group</p>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
              {classes.map(cls => (
                <button
                  key={cls.ID}
                  onClick={() => setSelectedClass(cls.name)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
                    selectedClass === cls.name
                      ? 'bg-college-700 text-white shadow'
                      : 'text-gray-600 hover:text-college-700'
                  }`}
                >
                  Class {cls.name}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl h-48 animate-pulse border border-gray-100"></div>
          ) : sessions.length > 0 ? (
            <div className="space-y-6">
              {sessions.slice(0, 3).map(session => {
                const sessionData = filtered.filter(s => s.session === session)
                if (sessionData.length === 0) return null
                return (
                  <div key={session} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="px-6 py-4 bg-college-50 border-b border-college-100">
                      <h3 className="font-semibold text-college-900">Session: {session} — Class {selectedClass}</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Group</th>
                            <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Male</th>
                            <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Female</th>
                            <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {sessionData.map(s => (
                            <tr key={s.ID} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span>{GROUP_INFO[s.group?.name]?.icon || '📚'}</span>
                                  <span className="font-medium text-gray-800 text-sm">{s.group?.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center text-sm text-gray-700">{s.total_male}</td>
                              <td className="px-6 py-4 text-center text-sm text-gray-700">{s.total_female}</td>
                              <td className="px-6 py-4 text-center">
                                <span className="bg-college-100 text-college-800 font-bold text-sm px-3 py-1 rounded-full">{s.total}</span>
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-college-50 font-semibold">
                            <td className="px-6 py-4 text-college-900 text-sm font-bold">Total</td>
                            <td className="px-6 py-4 text-center text-sm text-college-900">{sessionData.reduce((a, s) => a + (s.total_male || 0), 0)}</td>
                            <td className="px-6 py-4 text-center text-sm text-college-900">{sessionData.reduce((a, s) => a + (s.total_female || 0), 0)}</td>
                            <td className="px-6 py-4 text-center">
                              <span className="bg-college-700 text-white font-bold text-sm px-3 py-1 rounded-full">{sessionData.reduce((a, s) => a + (s.total || 0), 0)}</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-100">
              <div className="text-4xl mb-3">📊</div>
              <p>No student summary data available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
