import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Admin } from './pages/Admin'
import { Booking } from './pages/Booking'
import { Home } from './pages/Home'
import { Contact } from './pages/Contact'
import { Menu } from './pages/Menu'
import { WebForBusiness } from './pages/WebForBusiness'
import { GiftScratch } from './pages/GiftScratch'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/services" element={<Navigate to="/menu" replace />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/gift-scratch" element={<GiftScratch />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/website-for-business" element={<WebForBusiness />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
