import { useState, useEffect } from 'react'
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom'
import { getCollegeInfo, getNotices } from '../hooks/useApi'

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/academics', label: 'Academics' },
  { to: '/results', label: 'Result' },
  { to: '/notices', label: 'Notice' },
  { to: '/gov-orders', label: 'Gov Order' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/teachers', label: 'Teachers' },
  { to: '/staff', label: 'Staff' },
  { to: '/contact', label: 'Contact' },
]

export default function Layout() {
  const [info, setInfo] = useState(null)
  const [notices, setNotices] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    getCollegeInfo().then(setInfo).catch(() => {})
    getNotices().then(n => setNotices(n?.slice(0, 5) || [])).catch(() => {})
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo(0, 0)
  }, [location])

  const tickerText = notices.map(n => `📌 ${n.Title}`).join('   •••   ')

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <div className="bg-college-900 text-white text-xs py-2 px-4 hidden md:flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <svg className="w-3 h-3 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
            </svg>
            {info?.mobile || '+880-XXXXXXXXXX'}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3 h-3 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
            </svg>
            {info?.email || 'info@satbariacollege.edu.bd'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400">Est. {info?.est_year || '1966'} | EIIN: {info?.eiin || '125731'}</span>
          <Link to="/feedback" className="bg-gold-500 hover:bg-gold-600 text-college-900 font-semibold px-3 py-0.5 rounded text-xs transition">
            Send Message
          </Link>
        </div>
      </div>

      {/* News Ticker */}
      {notices.length > 0 && (
        <div className="bg-college-700 text-white text-xs py-1.5 overflow-hidden flex items-center">
          <span className="bg-gold-500 text-college-900 font-bold px-3 py-1 text-xs shrink-0 mr-3">NOTICE</span>
          <div className="overflow-hidden flex-1">
            <div className="news-ticker text-sm">
              {tickerText}
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white border-b border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-college-800 rounded-full flex items-center justify-center shadow-md group-hover:bg-college-700 transition">
                <svg className="w-5 h-5 text-gold-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
                </svg>
              </div>
              <div>
                <p className="font-display font-bold text-college-900 text-base leading-tight">Satbaria Degree College</p>
                <p className="text-xs text-gray-500 font-body">Sujanagar, Pabna</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? 'text-college-700 bg-college-50 font-semibold'
                        : 'text-gray-700 hover:text-college-700 hover:bg-gray-50'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive ? 'text-college-700 bg-college-50 font-semibold' : 'text-gray-700 hover:text-college-700 hover:bg-gray-50'
                  }`
                }
              >
                About
              </NavLink>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {[...NAV_ITEMS, { to: '/about', label: 'About' }].map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive ? 'bg-college-50 text-college-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-college-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* College Info */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-college-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-display font-bold text-lg">{info?.name || 'Satbaria Degree College'}</p>
                  <p className="text-blue-300 text-xs">{info?.address || 'Sujanagar, Pabna'}</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                {info?.about?.slice(0, 180) || 'A prestigious institution of higher education in Sujanagar, Pabna, Bangladesh, established in 1966.'}...
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-8 h-8 bg-blue-700 hover:bg-blue-600 rounded-full flex items-center justify-center transition text-xs">f</a>
                <a href="#" className="w-8 h-8 bg-sky-600 hover:bg-sky-500 rounded-full flex items-center justify-center transition text-xs">t</a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-gold-400 mb-4 text-sm uppercase tracking-wide">Quick Links</h4>
              <ul className="space-y-2">
                {NAV_ITEMS.map(item => (
                  <li key={item.to}>
                    <Link to={item.to} className="text-gray-400 hover:text-white text-sm transition flex items-center gap-2">
                      <span className="text-gold-500">›</span>{item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-gold-400 mb-4 text-sm uppercase tracking-wide">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex gap-2">
                  <span className="text-gold-500 mt-0.5 shrink-0">📍</span>
                  <span>{info?.address || 'Sujanagar, Pabna-6850'}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gold-500 shrink-0">📞</span>
                  <span>{info?.mobile || '+880-XXXXXXXXXX'}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gold-500 shrink-0">✉️</span>
                  <span>{info?.email || 'info@satbariacollege.edu.bd'}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gold-500 shrink-0">🏛</span>
                  <span>Est. {info?.est_year || '1966'} | EIIN: {info?.eiin || '125731'}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Satbaria Degree College. All rights reserved.</p>
            <Link to="/admin/login" className="text-gray-600 hover:text-gray-400 text-xs transition">Admin Panel</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}