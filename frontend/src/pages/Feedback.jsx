import { useState } from 'react'
import { submitFeedback } from '../hooks/useApi'

export default function Feedback() {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', subject: '', message: '' })
  const [status, setStatus] = useState(null) // 'loading' | 'success' | 'error'

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setStatus('loading')
    try {
      await submitFeedback(form)
      setStatus('success')
      setForm({ name: '', email: '', mobile: '', subject: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <div>
      <div className="bg-gradient-to-br from-college-900 to-college-800 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-blue-300 text-sm mb-3">
            <span>Home</span><span>›</span><span>Feedback</span>
          </div>
          <h1 className="font-display text-4xl font-bold mb-2">Send a Message</h1>
          <p className="text-blue-200">We'd love to hear from you</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {status === 'success' ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="font-display text-2xl font-bold text-green-800 mb-2">Message Sent!</h2>
            <p className="text-green-700 mb-6">Thank you for reaching out. We'll get back to you soon.</p>
            <button onClick={() => setStatus(null)} className="bg-college-700 hover:bg-college-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition">
              Send Another
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="font-display text-2xl font-bold text-college-900 mb-6">Contact Form</h2>

            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
                Something went wrong. Please try again.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                  <input
                    type="text" name="name" required value={form.name} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-college-500 focus:border-transparent outline-none transition"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email" name="email" value={form.email} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-college-500 focus:border-transparent outline-none transition"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile</label>
                  <input
                    type="tel" name="mobile" value={form.mobile} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-college-500 focus:border-transparent outline-none transition"
                    placeholder="+880-XXXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
                  <input
                    type="text" name="subject" value={form.subject} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-college-500 focus:border-transparent outline-none transition"
                    placeholder="Message subject"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message *</label>
                <textarea
                  name="message" required rows={5} value={form.message} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-college-500 focus:border-transparent outline-none transition resize-none"
                  placeholder="Write your message here..."
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-college-700 hover:bg-college-800 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm"
              >
                {status === 'loading' ? 'Sending...' : 'Send Message →'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
