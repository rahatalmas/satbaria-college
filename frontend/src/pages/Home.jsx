import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCollegeInfo, getNotices, getStudentSummary } from '../hooks/useApi'

function StatCard({ value, label, icon }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-xl p-5 text-center border border-white/20">
      <div className="text-3xl mb-1">{icon}</div>
      <div className="text-2xl font-display font-bold text-white">{value}</div>
      <div className="text-blue-200 text-xs mt-1 font-medium">{label}</div>
    </div>
  )
}

function NoticeCard({ notice }) {
  const date = new Date(notice.publish_date).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })
  return (
    <Link to={`/notices/${notice.ID}`}
      className="flex items-start gap-3 p-4 hover:bg-college-50 rounded-xl transition-colors group border-b border-gray-100 last:border-0">
      <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg ${notice.is_pinned ? 'bg-red-100' : 'bg-college-100'}`}>
        {notice.is_pinned ? '📌' : '📋'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 group-hover:text-college-700 transition truncate">{notice.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{date}</p>
      </div>
      <svg className="w-4 h-4 text-gray-300 group-hover:text-college-500 transition mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}

const QUICK_LINKS = [
  { to: '/academics', icon: '🎓', label: 'Academics', desc: 'Programs & Groups' },
  { to: '/results', icon: '📊', label: 'Results', desc: 'Download Results' },
  { to: '/teachers', icon: '👨‍🏫', label: 'Teachers', desc: 'Faculty Directory' },
  { to: '/gallery', icon: '🖼️', label: 'Gallery', desc: 'Photo Gallery' },
  { to: '/notices', icon: '📢', label: 'Notices', desc: 'Latest Notices' },
  { to: '/contact', icon: '📍', label: 'Contact', desc: 'Find Us' },
]

export default function Home() {
  const [info, setInfo] = useState(null)
  const [notices, setNotices] = useState([])
  const [summary, setSummary] = useState([])

  useEffect(() => {
    getCollegeInfo().then(setInfo).catch(() => {})
    getNotices().then(n => setNotices(n?.slice(0, 6) || [])).catch(() => {})
    getStudentSummary().then(setSummary).catch(() => {})
  }, [])

  const totalStudents = summary.reduce((acc, s) => acc + (s.total || 0), 0)

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-college-950 via-college-900 to-college-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-college-500/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 bg-gold-500/20 text-gold-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-gold-500/30">
                <span className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-pulse"></span>
                Est. {info?.est_year || '1966'} | EIIN: {info?.eiin || '125731'}
              </div>
              <h1 className="font-display text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6">
                {info?.name || 'Satbaria Degree College'}
              </h1>
              <p className="text-blue-200 text-lg leading-relaxed mb-8 max-w-lg">
                {info?.about?.slice(0, 200) || 'A prestigious institution of higher education nurturing bright minds in Sujanagar, Pabna since 1966.'}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/academics" className="bg-gold-500 hover:bg-gold-600 text-college-900 font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm">
                  Explore Academics →
                </Link>
                <Link to="/contact" className="border border-white/30 hover:border-white/60 text-white px-6 py-3 rounded-xl transition-all text-sm hover:bg-white/10">
                  Get Directions
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard value={`${info?.est_year ? new Date().getFullYear() - parseInt(info.est_year) : '55'}+`} label="Years of Excellence" icon="🏛️" />
              <StatCard value={totalStudents > 0 ? `${totalStudents}+` : '2000+'} label="Students" icon="🎓" />
              <StatCard value="3" label="Academic Groups" icon="📚" />
              <StatCard value="30+" label="Faculty Members" icon="👨‍🏫" />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Grid */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {QUICK_LINKS.map(link => (
              <Link key={link.to} to={link.to}
                className="flex flex-col items-center gap-2 p-5 bg-gray-50 hover:bg-college-50 border border-gray-100 hover:border-college-200 rounded-2xl text-center transition-all duration-200 group hover:shadow-md">
                <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{link.icon}</span>
                <span className="font-semibold text-gray-800 text-sm group-hover:text-college-700 transition">{link.label}</span>
                <span className="text-xs text-gray-400">{link.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Notices + About */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Notices */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="section-title text-2xl">Latest Notices</h2>
                  <p className="text-gray-400 text-sm">Stay updated with college announcements</p>
                </div>
                <Link to="/notices" className="text-college-700 hover:text-college-800 text-sm font-medium flex items-center gap-1">
                  View all <span>›</span>
                </Link>
              </div>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                {notices.length > 0 ? (
                  notices.map(n => <NoticeCard key={n.ID} notice={n} />)
                ) : (
                  <div className="p-12 text-center text-gray-400">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-sm">No notices available.</p>
                  </div>
                )}
              </div>
            </div>

            {/* About + Academics */}
            <div className="space-y-6">
              {/* About Card */}
              <div className="bg-gradient-to-br from-college-800 to-college-900 rounded-2xl p-6 text-white">
                <h3 className="font-display text-xl font-bold mb-3">About College</h3>
                <p className="text-blue-200 text-sm leading-relaxed mb-4">
                  {info?.history?.slice(0, 200) || 'Founded in 1966, Satbaria Degree College has been a beacon of quality education for over five decades in the Sujanagar Upazila of Pabna.'}
                </p>
                <Link to="/about" className="inline-flex items-center text-gold-400 hover:text-gold-300 text-sm font-medium transition">
                  Read more <span className="ml-1">→</span>
                </Link>
              </div>

              {/* Academic Groups */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="font-display text-lg font-bold text-college-900 mb-4">Academic Groups</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Science', icon: '🔬', color: 'bg-blue-50 text-blue-700 border-blue-100' },
                    { name: 'Business Studies', icon: '📈', color: 'bg-green-50 text-green-700 border-green-100' },
                    { name: 'Humanities', icon: '📖', color: 'bg-purple-50 text-purple-700 border-purple-100' },
                  ].map(g => (
                    <div key={g.name} className={`flex items-center gap-3 p-3 rounded-xl border ${g.color}`}>
                      <span className="text-xl">{g.icon}</span>
                      <span className="font-medium text-sm">{g.name}</span>
                    </div>
                  ))}
                  <Link to="/academics" className="block text-center text-college-700 hover:text-college-800 text-sm font-medium mt-2 py-2 border border-college-200 rounded-xl hover:bg-college-50 transition">
                    View Student Summary →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-gold-500 to-gold-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-college-900 mb-4">Have Questions?</h2>
          <p className="text-college-800 mb-8">Reach out to us for admissions, academics, or any other inquiries.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="bg-college-900 hover:bg-college-800 text-white px-8 py-3 rounded-xl font-semibold transition shadow-lg">
              Contact Us
            </Link>
            <Link to="/feedback" className="bg-white hover:bg-gray-50 text-college-900 px-8 py-3 rounded-xl font-semibold transition shadow-lg">
              Send Message
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
