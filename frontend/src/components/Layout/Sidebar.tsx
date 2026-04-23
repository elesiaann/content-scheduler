import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Calendar, Clock, Settings,
  Zap, Plus, ChevronRight
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/posts', icon: FileText, label: 'Posts' },
  { to: '/schedule', icon: Clock, label: 'Schedule' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-none">ContentFlow</h1>
            <p className="text-xs text-slate-500 mt-0.5">Social Scheduler</p>
          </div>
        </div>
      </div>

      {/* New Post Button */}
      <div className="p-4">
        <NavLink
          to="/posts/new"
          className="flex items-center justify-center gap-2 w-full bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2.5 rounded-xl transition-all duration-200 text-sm"
        >
          <Plus className="w-4 h-4" />
          New Post
        </NavLink>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {label}
                {isActive && <ChevronRight className="w-3 h-3 ml-auto text-primary-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Platform indicators */}
      <div className="px-4 py-4 border-t border-slate-800">
        <p className="text-xs text-slate-500 font-medium mb-2 px-1">PLATFORMS</p>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 bg-blue-600/10 border border-blue-600/20 rounded-lg px-2.5 py-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-xs text-blue-400 font-medium">Facebook</span>
          </div>
          <div className="flex items-center gap-1.5 bg-pink-600/10 border border-pink-600/20 rounded-lg px-2.5 py-1.5">
            <div className="w-2 h-2 rounded-full bg-pink-500"></div>
            <span className="text-xs text-pink-400 font-medium">TikTok</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
