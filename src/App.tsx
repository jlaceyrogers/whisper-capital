import { Routes, Route } from 'react-router'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Contact from '@/pages/Contact'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  )
}
