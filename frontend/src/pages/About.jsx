import { useState, useEffect } from 'react'
import { getCollegeInfo } from '../hooks/useApi'

export default function About() {
  const [info, setInfo] = useState(null)

  useEffect(() => {
    getCollegeInfo().then(setInfo).catch(() => {})
  }, [])

  return (
    <div>
      <div className="bg-gradient-to-br from-college-900 to-college-800 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-blue-300 text-sm mb-3">
            <span>Home</span><span>›</span><span>About</span>
          </div>
          <h1 className="font-display text-4xl font-bold mb-2">About College</h1>
          <p className="text-blue-200">Our history, mission and vision</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: '🏛', value: info?.est_year || '1966', label: 'Established' },
            { icon: '🆔', value: info?.eiin || '125731', label: 'EIIN Number' },
            { icon: '🎓', value: '3', label: 'Departments' },
            { icon: '📍', value: 'Sujanagar', label: 'Location' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="font-display font-bold text-2xl text-college-900">{s.value}</div>
              <div className="text-gray-500 text-xs mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="font-display text-2xl font-bold text-college-900 mb-4">Our History</h2>
          <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed">
            <p>{info?.history || 'Founded in 1966, Satbaria Degree College has been a beacon of quality education for over five decades in the Sujanagar Upazila of Pabna district, Bangladesh. The college has produced thousands of graduates who have gone on to make significant contributions in various fields across the country and beyond.'}</p>
          </div>
        </div>

        {/* About */}
        <div className="bg-gradient-to-br from-college-800 to-college-900 rounded-2xl p-8 text-white">
          <h2 className="font-display text-2xl font-bold mb-4">Mission & Vision</h2>
          <p className="text-blue-200 leading-relaxed">
            {info?.about || 'Satbaria Degree College is committed to providing quality higher secondary education in a supportive and inclusive environment. Our mission is to nurture the intellectual, moral, and social development of our students, preparing them to be responsible citizens and leaders of tomorrow.'}
          </p>
        </div>
      </div>
    </div>
  )
}
