import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getGovOrder } from '../hooks/useApi'
import AttachmentViewer from '../components/AttachmentViewer'

export default function GovOrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getGovOrder(id).then(data => {
      setOrder(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <div className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100"></div>
    </div>
  )

  if (!order) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-400">
      <div className="text-5xl mb-4">🔍</div>
      <p>Gov order not found.</p>
      <Link to="/gov-orders" className="text-college-700 mt-4 inline-block">← Back to Gov Orders</Link>
    </div>
  )

  const orderDate = order.order_date ? new Date(order.order_date).toLocaleDateString('en-BD', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : null

  return (
    <div>
      <div className="bg-gradient-to-br from-college-900 to-college-800 text-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-blue-300 text-sm mb-3">
            <Link to="/" className="hover:text-white">Home</Link><span>›</span>
            <Link to="/gov-orders" className="hover:text-white">Gov Orders</Link><span>›</span>
            <span className="text-white">Detail</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/gov-orders" className="inline-flex items-center gap-2 text-college-700 hover:text-college-800 text-sm font-medium mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Gov Orders
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8">
            {order.is_pinned && (
              <span className="inline-block bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-medium mb-4">📌 Pinned</span>
            )}
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-4">{order.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-gray-400 text-sm mb-6 pb-6 border-b border-gray-100">
              {order.order_number && <><span>📄 Order No: {order.order_number}</span><span>•</span></>}
              {orderDate && <><span>📅 {orderDate}</span><span>•</span></>}
              <span>Satbaria Degree College</span>
            </div>
            {order.content && (
              <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">
                {order.content}
              </div>
            )}
            {order.attachment && (
              <AttachmentViewer path={order.attachment} name={order.attachment_name} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
