import { useState, useEffect } from 'react'
import { getGallery, assetUrl } from '../hooks/useApi'

export default function Gallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    getGallery(category).then(data => {
      setImages(data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [category])

  const categories = ['', ...new Set(images.map(i => i.category).filter(Boolean))]

  return (
    <div>
      <div className="bg-gradient-to-br from-college-900 to-college-800 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-blue-300 text-sm mb-3">
            <span>Home</span><span>›</span><span>Gallery</span>
          </div>
          <h1 className="font-display text-4xl font-bold mb-2">Photo Gallery</h1>
          <p className="text-blue-200">Memories and moments from campus life</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                category === cat
                  ? 'bg-college-700 text-white shadow'
                  : 'bg-white text-gray-600 hover:text-college-700 border border-gray-200 hover:border-college-200'
              }`}
            >
              {cat || 'All Photos'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map(img => (
              <div
                key={img.ID}
                onClick={() => setLightbox(img)}
                className="aspect-square rounded-2xl overflow-hidden cursor-pointer group relative bg-gray-100 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <img
                  src={assetUrl(img.image_path)}
                  alt={img.title || 'Gallery'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={e => { e.target.src = 'https://via.placeholder.com/400x400?text=Image' }}
                />
                {img.title && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-medium truncate">{img.title}</p>
                    {img.category && <p className="text-white/70 text-xs">{img.category}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🖼️</div>
            <p className="text-lg font-medium">No images in gallery</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl font-light">×</button>
          <div onClick={e => e.stopPropagation()} className="max-w-4xl max-h-screen">
            <img
              src={assetUrl(lightbox.image_path)}
              alt={lightbox.title}
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
            {lightbox.title && (
              <p className="text-white text-center mt-4 font-medium">{lightbox.title}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
