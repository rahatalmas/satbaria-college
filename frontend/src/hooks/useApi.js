import axios from 'axios'

export const API_DOMAIN = 'https://api.satbariadegreecollege.edu.bd'

const api = axios.create({
  baseURL: `${API_DOMAIN}/api/v1`,
  timeout: 10000,
})

// Resolve a (possibly relative) asset path against the API domain so that
// uploaded images load correctly both in dev and after build.
export const assetUrl = (path) => {
  if (!path) return path
  if (/^https?:\/\//i.test(path)) return path
  return `${API_DOMAIN}${path.startsWith('/') ? '' : '/'}${path}`
}

// Build a force-download URL that serves the file with a
// Content-Disposition: attachment header (works cross-origin).
export const downloadUrl = (path, name) => {
  if (!path) return path
  const params = new URLSearchParams({ file: path })
  if (name) params.set('name', name)
  return `${API_DOMAIN}/download?${params.toString()}`
}

// College Info
export const getCollegeInfo = () => api.get('/college-info').then(r => r.data.data)

// Teachers
export const getTeachers = () => api.get('/teachers').then(r => r.data.data)

// Staff
export const getStaff = () => api.get('/staff').then(r => r.data.data)

// Notices
export const getNotices = () => api.get('/notices').then(r => r.data.data)
export const getNotice = (id) => api.get(`/notices/${id}`).then(r => r.data.data)

// Gov Orders
export const getGovOrders = () => api.get('/gov-orders').then(r => r.data.data)
export const getGovOrder = (id) => api.get(`/gov-orders/${id}`).then(r => r.data.data)

// Gallery
export const getGallery = (category = '') =>
  api.get('/gallery', { params: category ? { category } : {} }).then(r => r.data.data)

// Results
export const getResults = (params = {}) =>
  api.get('/results', { params }).then(r => r.data.data)

// Student Summary
export const getStudentSummary = (params = {}) =>
  api.get('/student-summary', { params }).then(r => r.data.data)

// Classes & Groups
export const getClasses = () => api.get('/classes').then(r => r.data.data)
export const getGroups = () => api.get('/groups').then(r => r.data.data)

// Feedback
export const submitFeedback = (data) => api.post('/feedback', data).then(r => r.data)

export default api
