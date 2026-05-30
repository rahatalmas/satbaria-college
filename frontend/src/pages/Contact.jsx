import { useState, useEffect } from 'react'
import { getCollegeInfo } from '../hooks/useApi'

export default function Contact() {
  const [info, setInfo] = useState(null)

  useEffect(() => {
    getCollegeInfo().then(setInfo).catch(() => {})
  }, [])

  return (
    <div>
      <div className="bg-gradient-to-br from-college-900 to-college-800 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-blue-300 text-sm mb-3">
            <span>Home</span><span>›</span><span>Contact</span>
          </div>
          <h1 className="font-display text-4xl font-bold mb-2">Contact Us</h1>
          <p className="text-blue-200">Get in touch with Satbaria Degree College</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Cards */}
          <div className="space-y-5">
            {[
              {
                icon: '📍',
                title: 'Address',
                value: info?.address || 'Sujanagar, Pabna-6850, Bangladesh',
                color: 'bg-red-50 border-red-100'
              },
              {
                icon: '📞',
                title: 'Phone',
                value: info?.mobile || '+880-XXXXXXXXXX',
                color: 'bg-green-50 border-green-100'
              },
              {
                icon: '✉️',
                title: 'Email',
                value: info?.email || 'info@satbariacollege.edu.bd',
                color: 'bg-blue-50 border-blue-100'
              },
              {
                icon: '🏛',
                title: 'Established',
                value: `${info?.est_year || '1966'} | EIIN: ${info?.eiin || '125731'}`,
                color: 'bg-yellow-50 border-yellow-100'
              },
            ].map(item => (
              <div key={item.title} className={`rounded-2xl p-5 border ${item.color} flex items-start gap-4`}>
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{item.title}</p>
                  <p className="text-gray-800 font-medium text-sm">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-full min-h-80">
              {info?.map_embed_url ? (
                <iframe
                  src={info.map_embed_url}
                  className="w-full h-full min-h-80"
                  frameBorder="0"
                  allowFullScreen
                  loading="lazy"
                  title="College Location"
                ></iframe>
              ) : (
                <div className="w-full h-full min-h-80 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                  <div className="text-5xl mb-4">🗺️</div>
                  <p className="font-medium">Map not configured</p>
                  <p className="text-sm mt-1">Add Google Maps embed URL in admin settings</p>
                  <a
                    href="https://maps.google.com/?q=Sujanagar+Pabna+Bangladesh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 text-college-700 hover:text-college-800 text-sm font-medium"
                  >
                    Open in Google Maps →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Office Hours */}
        <div className="mt-10 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-display text-xl font-bold text-college-900 mb-4">Office Hours</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { day: 'Sunday – Thursday', time: '9:00 AM – 4:00 PM', open: true },
              { day: 'Friday', time: 'Closed', open: false },
              { day: 'Saturday', time: '10:00 AM – 2:00 PM', open: true },
              { day: 'Public Holidays', time: 'Closed', open: false },
            ].map(h => (
              <div key={h.day} className={`rounded-xl p-4 border ${h.open ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                <p className="text-xs font-semibold text-gray-600 mb-1">{h.day}</p>
                <p className={`font-bold text-sm ${h.open ? 'text-green-700' : 'text-gray-400'}`}>{h.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
