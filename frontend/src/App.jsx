import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Academics from './pages/Academics'
import Teachers from './pages/Teachers'
import Staff from './pages/Staff'
import Notices from './pages/Notices'
import NoticeDetail from './pages/NoticeDetail'
import GovOrders from './pages/GovOrders'
import GovOrderDetail from './pages/GovOrderDetail'
import Gallery from './pages/Gallery'
import Results from './pages/Results'
import Contact from './pages/Contact'
import About from './pages/About'
import Feedback from './pages/Feedback'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="academics" element={<Academics />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="staff" element={<Staff />} />
          <Route path="notices" element={<Notices />} />
          <Route path="notices/:id" element={<NoticeDetail />} />
          <Route path="gov-orders" element={<GovOrders />} />
          <Route path="gov-orders/:id" element={<GovOrderDetail />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="results" element={<Results />} />
          <Route path="contact" element={<Contact />} />
          <Route path="about" element={<About />} />
          <Route path="feedback" element={<Feedback />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
