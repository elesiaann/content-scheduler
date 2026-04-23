import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { FileText, Clock, CheckCircle, XCircle, Facebook, Music2, TrendingUp, Plus, ArrowRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import api from '../utils/api'
import { Stats, Post } from '../types'
import { formatRelative, PLATFORM_COLORS, STATUS_COLORS } from '../utils/helpers'
import { format } from 'date-fns'

function StatCard({ icon: Icon, label, value, color, bg }: any) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: statsData } = useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: () => api.get('/posts/stats').then(r => r.data),
  })

  const { data: upcomingData } = useQuery<{ posts: Post[] }>({
    queryKey: ['upcoming'],
    queryFn: () => api.get('/posts/upcoming').then(r => r.data),
  })

  const stats = statsData || { total: 0, scheduled: 0, published: 0, draft: 0, failed: 0, facebook: 0, tiktok: 0, recentActivity: [] }
  const upcoming = upcomingData?.posts || []

  // Fill in missing days for chart
  const chartData = (() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = format(d, 'yyyy-MM-dd')
      const existing = stats.recentActivity.find(a => a.date === dateStr)
      days.push({ date: format(d, 'EEE'), count: existing?.count || 0 })
    }
    return days
  })()

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner */}
      <div className="card p-6 bg-gradient-to-r from-primary-900/40 to-slate-900 border-primary-800/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Welcome to ContentFlow</h3>
            <p className="text-slate-400 text-sm">Manage your TikTok and Facebook content all in one place</p>
          </div>
          <Link to="/posts/new" className="btn-primary">
            <Plus className="w-4 h-4" />
            Create Post
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Total Posts" value={stats.total} color="text-primary-400" bg="bg-primary-600/20" />
        <StatCard icon={Clock} label="Scheduled" value={stats.scheduled} color="text-blue-400" bg="bg-blue-600/20" />
        <StatCard icon={CheckCircle} label="Published" value={stats.published} color="text-green-400" bg="bg-green-600/20" />
        <StatCard icon={XCircle} label="Failed" value={stats.failed} color="text-red-400" bg="bg-red-600/20" />
      </div>

      {/* Platform stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <Facebook className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-white">Facebook</p>
              <p className="text-xs text-slate-400">Posts scheduled or published</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{stats.facebook}</div>
          <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-700"
              style={{ width: stats.total > 0 ? `${(stats.facebook / stats.total) * 100}%` : '0%' }}
            />
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-pink-600/20 rounded-xl flex items-center justify-center">
              <Music2 className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <p className="font-semibold text-white">TikTok</p>
              <p className="text-xs text-slate-400">Posts scheduled or published</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{stats.tiktok}</div>
          <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-pink-500 rounded-full transition-all duration-700"
              style={{ width: stats.total > 0 ? `${(stats.tiktok / stats.total) * 100}%` : '0%' }}
            />
          </div>
        </div>
      </div>

      {/* Chart + Upcoming */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Activity chart */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-primary-400" />
            <h3 className="font-semibold text-white">Posts This Week</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#e2e8f0' }}
                cursor={{ fill: '#1e293b' }}
              />
              <Bar dataKey="count" name="Posts" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Upcoming posts */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white">Upcoming Posts</h3>
            </div>
            <Link to="/schedule" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-10 h-10 text-slate-700 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No upcoming posts</p>
              <Link to="/posts/new" className="text-primary-400 text-xs hover:text-primary-300 mt-1 inline-block">
                Schedule your first post →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map(post => {
                const pColor = PLATFORM_COLORS[post.platform]
                return (
                  <div key={post.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                    <div className={`w-8 h-8 ${pColor.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      {post.platform === 'facebook'
                        ? <Facebook className={`w-4 h-4 ${pColor.text}`} />
                        : post.platform === 'tiktok'
                        ? <Music2 className={`w-4 h-4 ${pColor.text}`} />
                        : <TrendingUp className={`w-4 h-4 ${pColor.text}`} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{post.title}</p>
                      <p className="text-xs text-slate-500">{formatRelative(post.scheduled_at)}</p>
                    </div>
                    <span className={`badge ${STATUS_COLORS.scheduled.bg} ${STATUS_COLORS.scheduled.text} border ${STATUS_COLORS.scheduled.border}`}>
                      Scheduled
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="card p-5">
        <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/posts/new', icon: Plus, label: 'New Post', color: 'text-primary-400', bg: 'bg-primary-600/20 hover:bg-primary-600/30' },
            { to: '/schedule', icon: Clock, label: 'View Schedule', color: 'text-blue-400', bg: 'bg-blue-600/20 hover:bg-blue-600/30' },
            { to: '/calendar', icon: FileText, label: 'Calendar', color: 'text-purple-400', bg: 'bg-purple-600/20 hover:bg-purple-600/30' },
            { to: '/settings', icon: TrendingUp, label: 'Connect Platforms', color: 'text-green-400', bg: 'bg-green-600/20 hover:bg-green-600/30' },
          ].map(({ to, icon: Icon, label, color, bg }) => (
            <Link key={to} to={to} className={`${bg} border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-2 transition-all duration-200 group`}>
              <Icon className={`w-6 h-6 ${color}`} />
              <span className="text-xs font-medium text-slate-300 text-center">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
