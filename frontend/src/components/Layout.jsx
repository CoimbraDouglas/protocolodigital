import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-vinho-50/60 to-gray-100">
      <Header onToggleSidebar={() => setSidebarOpen(v => !v)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="pt-16">
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
