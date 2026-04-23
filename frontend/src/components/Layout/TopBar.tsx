import { useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/posts': 'All Posts',
  '/posts/new': 'New Post',
  '/schedule': 'Schedule',
  '/calendar': 'Calendar',
  '/settings': 'Settings',
}

export default function TopBar() {
  const location = useLocation()

  const title = Object.entries(pageTitles).find(([path]) =>
    location.pathname === path || location.pathname.startsWith(path + '/')
  )?.[1] || 'ContentFlow'

  return (
    <header className="h-16 bg-slate-900/50 border-b border-slate-800 backdrop-blur-sm flex items-center px-6 gap-4 sticky top-0 z-10">
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-xs text-slate-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <button className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all duration-200">
        <Bell className="w-5 h-5" />
      </button>
    </header>
  )
}
