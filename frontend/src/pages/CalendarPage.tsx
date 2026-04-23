import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus, Facebook, Music2, Globe } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from 'date-fns'
import api from '../utils/api'
import { Post } from '../types'
import { PLATFORM_COLORS } from '../utils/helpers'

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const { data } = useQuery({
    queryKey: ['calendar', format(currentMonth, 'yyyy-MM')],
    queryFn: () => api.get('/posts/calendar', {
      params: {
        month: format(currentMonth, 'M'),
        year: format(currentMonth, 'yyyy'),
      }
    }).then(r => r.data),
  })

  const calendarPosts: Post[] = data?.posts || []

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Pad to start on Sunday
  const startPad = monthStart.getDay()
  const paddedDays: (Date | null)[] = [
    ...Array(startPad).fill(null),
    ...days,
  ]

  const getPostsForDay = (date: Date) =>
    calendarPosts.filter(p => p.scheduled_at && isSameDay(new Date(p.scheduled_at), date))

  const selectedDayPosts = selectedDate ? getPostsForDay(selectedDate) : []

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">{calendarPosts.length} posts this month</p>
        <Link to="/posts/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </div>

      <div className="card overflow-hidden">
        {/* Calendar header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-white">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-slate-800">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center py-3 text-xs font-medium text-slate-500 uppercase">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {paddedDays.map((day, i) => {
            if (!day) {
              return <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-slate-800/50" />
            }

            const dayPosts = getPostsForDay(day)
            const isSelected = selectedDate && isSameDay(day, selectedDate)
            const isCurrentDay = isToday(day)
            const isCurrentMonth = isSameMonth(day, currentMonth)

            return (
              <div
                key={day.toISOString()}
                onClick={() => setSelectedDate(isSelected ? null : day)}
                className={`min-h-[100px] border-b border-r border-slate-800/50 p-2 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'bg-primary-600/10'
                    : isCurrentMonth
                    ? 'hover:bg-slate-800/50'
                    : 'opacity-40'
                }`}
              >
                <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1.5 ${
                  isCurrentDay
                    ? 'bg-primary-600 text-white'
                    : isSelected
                    ? 'bg-primary-600/30 text-primary-300'
                    : 'text-slate-300'
                }`}>
                  {format(day, 'd')}
                </div>

                <div className="space-y-1">
                  {dayPosts.slice(0, 3).map((post, idx) => {
                    const pColor = PLATFORM_COLORS[post.platform]
                    return (
                      <div
                        key={post.id}
                        className={`text-xs px-1.5 py-0.5 rounded-md truncate ${pColor.bg} ${pColor.text}`}
                        title={post.title}
                      >
                        {post.title}
                      </div>
                    )
                  })}
                  {dayPosts.length > 3 && (
                    <div className="text-xs text-slate-500 px-1">+{dayPosts.length - 3} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected day details */}
      {selectedDate && (
        <div className="card p-5 animate-slide-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">
              {format(selectedDate, 'EEEE, MMMM d')}
            </h3>
            <Link
              to={`/posts/new`}
              className="btn-primary text-sm px-3 py-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Post
            </Link>
          </div>

          {selectedDayPosts.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-slate-500 text-sm">No posts scheduled for this day</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDayPosts.map(post => {
                const pColor = PLATFORM_COLORS[post.platform]
                return (
                  <div key={post.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                    <div className={`w-8 h-8 ${pColor.bg} border ${pColor.border} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      {post.platform === 'facebook' ? (
                        <Facebook className={`w-4 h-4 ${pColor.text}`} />
                      ) : post.platform === 'tiktok' ? (
                        <Music2 className={`w-4 h-4 ${pColor.text}`} />
                      ) : (
                        <Globe className={`w-4 h-4 ${pColor.text}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-200 text-sm truncate">{post.title}</p>
                      <p className="text-xs text-slate-500">
                        {post.scheduled_at ? format(new Date(post.scheduled_at), 'h:mm a') : ''}
                        {' • '}
                        <span className={`capitalize ${pColor.text}`}>{post.platform}</span>
                      </p>
                    </div>
                    <Link
                      to={`/posts/${post.id}/edit`}
                      className="text-xs text-primary-400 hover:text-primary-300 flex-shrink-0"
                    >
                      Edit
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        <p className="text-xs text-slate-500 font-medium">LEGEND:</p>
        {[
          { label: 'Facebook', color: PLATFORM_COLORS.facebook },
          { label: 'TikTok', color: PLATFORM_COLORS.tiktok },
          { label: 'Both', color: PLATFORM_COLORS.both },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${color.bg} border ${color.border}`} />
            <span className="text-xs text-slate-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
