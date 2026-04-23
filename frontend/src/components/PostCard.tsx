import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, Facebook, Music2, Globe, Edit, Trash2, Copy, Send, AlertCircle, CheckCircle, FileText } from 'lucide-react'
import { Post } from '../types'
import { formatRelative, PLATFORM_COLORS, STATUS_COLORS } from '../utils/helpers'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useQueryClient } from '@tanstack/react-query'

interface PostCardProps {
  post: Post
}

const PlatformIcon = ({ platform }: { platform: string }) => {
  if (platform === 'facebook') return <Facebook className="w-3.5 h-3.5" />
  if (platform === 'tiktok') return <Music2 className="w-3.5 h-3.5" />
  return <Globe className="w-3.5 h-3.5" />
}

const StatusIcon = ({ status }: { status: string }) => {
  if (status === 'published') return <CheckCircle className="w-3.5 h-3.5" />
  if (status === 'failed') return <AlertCircle className="w-3.5 h-3.5" />
  if (status === 'scheduled') return <Clock className="w-3.5 h-3.5" />
  return <FileText className="w-3.5 h-3.5" />
}

export default function PostCard({ post }: PostCardProps) {
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
      queryClient.invalidateQueries({ queryKey: ['stats'] })
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
    <div className="card p-5 hover:border-slate-700 transition-all duration-200 group animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-slate-100 text-sm leading-snug line-clamp-2 flex-1">
          {post.title}
        </h3>
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
          {post.status !== 'published' && (
            <>
              <button
                onClick={() => navigate(`/posts/${post.id}/edit`)}
                className="p-1.5 text-slate-400 hover:text-primary-400 hover:bg-primary-600/10 rounded-lg transition-all"
                title="Edit"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDuplicate}
                className="p-1.5 text-slate-400 hover:text-green-400 hover:bg-green-600/10 rounded-lg transition-all"
                title="Duplicate"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <button
            onClick={handleDelete}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-600/10 rounded-lg transition-all"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Caption */}
      {post.caption && (
        <p className="text-slate-400 text-xs mb-3 line-clamp-2">{post.caption}</p>
      )}

      {/* Media thumbnail */}
      {(post.media_url || post.media_path) && (
        <div className="mb-3 rounded-xl overflow-hidden bg-slate-800 h-28">
          {post.media_type === 'image' ? (
            <img
              src={post.media_url || `/uploads/${post.media_path}`}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-1">
                  <Music2 className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500">Video</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {post.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
          {post.tags.length > 3 && (
            <span className="text-xs text-slate-500">+{post.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Error message */}
      {post.status === 'failed' && post.error_message && (
        <div className="mb-3 bg-red-600/10 border border-red-600/20 rounded-lg px-3 py-2">
          <p className="text-xs text-red-400">{post.error_message}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800">
        <div className="flex items-center gap-2">
          {/* Platform badge */}
          <span className={`badge ${platformColor.bg} ${platformColor.text} border ${platformColor.border}`}>
            <PlatformIcon platform={post.platform} />
            {post.platform === 'both' ? 'Both' : post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
          </span>
          {/* Status badge */}
          <span className={`badge ${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}>
            <StatusIcon status={post.status} />
            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
          </span>
        </div>

        {/* Schedule time or publish button */}
        {post.status === 'scheduled' && post.scheduled_at && (
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatRelative(post.scheduled_at)}
          </span>
        )}
        {post.status === 'published' && post.published_at && (
          <span className="text-xs text-green-600/70">
            Published {formatRelative(post.published_at)}
          </span>
        )}
        {(post.status === 'draft' || post.status === 'failed') && (
          <button
            onClick={handlePublishNow}
            disabled={isPublishing}
            className="flex items-center gap-1 text-xs bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 border border-primary-600/30 px-2.5 py-1 rounded-lg transition-all disabled:opacity-50"
          >
            <Send className="w-3 h-3" />
            {isPublishing ? 'Publishing...' : 'Publish Now'}
          </button>
        )}
      </div>
    </div>
  )
}
