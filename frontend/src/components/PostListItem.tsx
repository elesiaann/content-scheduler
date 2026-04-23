import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, Facebook, Music2, Globe, Edit, Trash2, Copy, Send, AlertCircle, CheckCircle } from 'lucide-react'
import { Post } from '../types'
import { formatRelative, PLATFORM_COLORS, STATUS_COLORS } from '../utils/helpers'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useQueryClient } from '@tanstack/react-query'

export default function PostListItem({ post }: { post: Post }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isPublishing, setIsPublishing] = useState(false)

  const platformColor = PLATFORM_COLORS[post.platform]
  const statusColor = STATUS_COLORS[post.status]

  const handleDelete = async () => {
    if (!confirm(`Delete "${post.title}"?`)) return
    try {
      await api.delete(`/posts/${post.id}`)
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      toast.success('Post deleted')
    } catch {
      toast.error('Failed to delete post')
    }
  }

  const handleDuplicate = async () => {
    try {
      await api.post(`/posts/${post.id}/duplicate`)
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Post duplicated')
    } catch {
      toast.error('Failed to duplicate post')
    }
  }

  const handlePublishNow = async () => {
    setIsPublishing(true)
    try {
      const res = await api.post(`/posts/${post.id}/publish`)
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      const { results } = res.data
      if (results.success.length > 0) {
        toast.success(`Published to ${results.success.map((r: any) => r.platform).join(', ')}!`)
      }
      if (results.failed.length > 0) {
        results.failed.forEach((f: any) => toast.error(`${f.platform}: ${f.error}`))
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Publish failed')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="card p-4 hover:border-slate-700 transition-all group flex items-center gap-4">
      {/* Media preview */}
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
        {post.media_type === 'image' && (post.media_url || post.media_path) ? (
          <img
            src={post.media_url || `/uploads/${post.media_path}`}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {post.platform === 'facebook'
              ? <Facebook className="w-6 h-6 text-blue-400" />
              : post.platform === 'tiktok'
              ? <Music2 className="w-6 h-6 text-pink-400" />
              : <Globe className="w-6 h-6 text-purple-400" />
            }
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-slate-100 text-sm truncate">{post.title}</h3>
          {post.status === 'failed' && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
          {post.status === 'published' && <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />}
        </div>
        {post.caption && (
          <p className="text-slate-400 text-xs truncate">{post.caption}</p>
        )}
        {post.status === 'failed' && post.error_message && (
          <p className="text-red-400 text-xs truncate mt-0.5">{post.error_message}</p>
        )}
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`badge ${platformColor.bg} ${platformColor.text} border ${platformColor.border} hidden sm:inline-flex`}>
          {post.platform === 'facebook' ? <Facebook className="w-3 h-3" /> : post.platform === 'tiktok' ? <Music2 className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
          {post.platform === 'both' ? 'Both' : post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
        </span>
        <span className={`badge ${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}>
          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
        </span>
      </div>

      {/* Schedule time */}
      {post.scheduled_at && (
        <div className="text-xs text-slate-500 flex items-center gap-1 flex-shrink-0 hidden md:flex">
          <Clock className="w-3 h-3" />
          {formatRelative(post.scheduled_at)}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {post.status !== 'published' && (
          <button onClick={() => navigate(`/posts/${post.id}/edit`)} className="p-1.5 text-slate-400 hover:text-primary-400 hover:bg-primary-600/10 rounded-lg transition-all" title="Edit">
            <Edit className="w-3.5 h-3.5" />
          </button>
        )}
        <button onClick={handleDuplicate} className="p-1.5 text-slate-400 hover:text-green-400 hover:bg-green-600/10 rounded-lg transition-all" title="Duplicate">
          <Copy className="w-3.5 h-3.5" />
        </button>
        {(post.status === 'draft' || post.status === 'failed') && (
          <button onClick={handlePublishNow} disabled={isPublishing} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-600/10 rounded-lg transition-all disabled:opacity-50" title="Publish Now">
            <Send className="w-3.5 h-3.5" />
          </button>
        )}
        <button onClick={handleDelete} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-600/10 rounded-lg transition-all" title="Delete">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
