import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Clock, Plus, Facebook, Music2, Globe, AlertCircle } from 'lucide-react'
import api from '../utils/api'
import { PostsResponse, Post } from '../types'
import { formatDate, PLATFORM_COLORS } from '../utils/helpers'
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns'

function groupPostsByDate(posts: Post[]) {
  const groups: Record<string, Post[]> = {}
  posts.forEach(post => {
    if (!post.scheduled_at) return
    const date = format(new Date(post.scheduled_at), 'yyyy-MM-dd')
    if (!groups[date]) groups[date] = []
    groups[date].push(post)
  })
  return groups
}

function dateLabel(dateStr: string): string {
  const d = new Date(dateStr)
  if (isToday(d)) return 'Today'
  if (isTomorrow(d)) return 'Tomorrow'
  if (isThisWeek(d)) return format(d, 'EEEE')
  return format(d, 'MMMM d, yyyy')
}

export default function SchedulePage() {
  const { data } = useQuery<PostsResponse>({
    queryKey: ['scheduled-posts'],
    queryFn: () => api.get('/posts', { params: { status: 'scheduled', limit: 50 } }).then(r => r.data),
  })

  const posts = data?.posts || []
  const grouped = groupPostsByDate(posts)
  const sortedDates = Object.keys(grouped).sort()

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">{posts.length} upcoming scheduled post{posts.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/posts/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          Schedule Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="card p-16 text-center">
          <Clock className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">Nothing Scheduled</h3>
          <p className="text-slate-500 text-sm mb-6">Start planning your content by scheduling posts ahead of time.</p>
          <Link to="/posts/new" className="btn-primary inline-flex">
            <Plus className="w-4 h-4" />
            Create Your First Scheduled Post
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedDates.map(date => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex flex-col items-center bg-primary-600/20 border border-primary-600/30 rounded-xl px-3 py-2">
                  <span className="text-xs text-primary-400 font-medium uppercase">
                    {format(new Date(date), 'MMM')}
                  </span>
                  <span className="text-2xl font-bold text-white leading-none">
                    {format(new Date(date), 'd')}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">{dateLabel(date)}</h3>
                  <p className="text-xs text-slate-500">{grouped[date].length} post{grouped[date].length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex-1 h-px bg-slate-800 ml-2" />
              </div>

              <div className="space-y-3 ml-16">
                {grouped[date].sort((a, b) =>
                  new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime()
                ).map(post => {
                  const pColor = PLATFORM_COLORS[post.platform]
                  return (
                    <div key={post.id} className="card p-4 hover:border-slate-700 transition-all group">
                      <div className="flex items-center gap-4">
                        {/* Time */}
                        <div className="text-center w-16 flex-shrink-0">
                          <p className="text-sm font-bold text-white">
                            {format(new Date(post.scheduled_at!), 'h:mm')}
                          </p>
                          <p className="text-xs text-slate-500">
                            {format(new Date(post.scheduled_at!), 'a')}
                          </p>
                        </div>

                        {/* Platform icon */}
                        <div className={`w-10 h-10 ${pColor.bg} border ${pColor.border} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          {post.platform === 'facebook' ? (
                            <Facebook className={`w-5 h-5 ${pColor.text}`} />
                          ) : post.platform === 'tiktok' ? (
                            <Music2 className={`w-5 h-5 ${pColor.text}`} />
                          ) : (
                            <Globe className={`w-5 h-5 ${pColor.text}`} />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-100 text-sm truncate">{post.title}</p>
                          {post.caption && (
                            <p className="text-slate-400 text-xs truncate mt-0.5">{post.caption}</p>
                          )}
                        </div>

                        {/* Platform badge */}
                        <span className={`badge ${pColor.bg} ${pColor.text} border ${pColor.border} hidden sm:inline-flex`}>
                          {post.platform === 'facebook' ? 'Facebook' : post.platform === 'tiktok' ? 'TikTok' : 'Both'}
                        </span>

                        {/* Edit link */}
                        <Link
                          to={`/posts/${post.id}/edit`}
                          className="opacity-0 group-hover:opacity-100 text-xs text-primary-400 hover:text-primary-300 transition-all"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
