import { useState } from 'react'
import { assetUrl, downloadUrl } from '../hooks/useApi'

// Renders an uploaded attachment (PDF, image, or any document) with the ability
// to view it inline, open it in a new tab, and download it.
// `path` is the raw stored path (e.g. /uploads/xxx); `name` is the friendly name.
export default function AttachmentViewer({ path, name }) {
  const [open, setOpen] = useState(false)
  if (!path) return null

  const url = assetUrl(path)
  const dlUrl = downloadUrl(path, name)

  const lower = (name || url).toLowerCase()
  const ext = lower.split('.').pop().split('?')[0]
  const isPdf = ext === 'pdf'
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext)
  const isViewable = isPdf || isImage
  const label = name || 'Attachment'

  const icon = isPdf ? '📄' : isImage ? '🖼️' : '📎'

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between gap-3 bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl">{icon}</span>
          <span className="text-sm font-medium text-gray-700 truncate">{label}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isViewable && (
            <button
              onClick={() => setOpen(o => !o)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-college-50 text-college-700 hover:bg-college-100 transition"
            >
              {open ? 'Hide' : '👁 View'}
            </button>
          )}
          <a
            href={url} target="_blank" rel="noopener noreferrer"
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-college-50 text-college-700 hover:bg-college-100 transition"
          >
            Open
          </a>
          <a
            href={dlUrl}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-college-600 text-white hover:bg-college-700 transition"
          >
            ⬇ Download
          </a>
        </div>
      </div>

      {open && isViewable && (
        <div className="bg-gray-100">
          {isPdf ? (
            <iframe src={url} title={label} className="w-full h-[80vh] border-0" />
          ) : (
            <img src={url} alt={label} className="w-full object-contain max-h-[80vh] mx-auto" />
          )}
        </div>
      )}
    </div>
  )
}
