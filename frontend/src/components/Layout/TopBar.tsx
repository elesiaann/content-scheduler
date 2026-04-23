import { useLocation } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

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
  const { user } = useAuth()

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

      <div className="flex items-center gap-3">
        <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all duration-200">
          <Search className="w-5 h-5" />
        </button>
        <button className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all duration-200">
          <Bell className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 bg-primary-600/20 border border-primary-600/30 rounded-full flex items-center justify-center">
          <span className="text-primary-400 font-semibold text-xs">
            {user?.username?.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  )
}
