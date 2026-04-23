import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Filter, Search, Grid, List } from 'lucide-react'
import api from '../utils/api'
import { PostsResponse, Platform, PostStatus } from '../types'
import PostCard from '../components/PostCard'
import PostListItem from '../components/PostListItem'

const PLATFORMS: { value: Platform | ''; label: string }[] = [
  { value: '', label: 'All Platforms' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'both', label: 'Both' },
]

const STATUSES: { value: PostStatus | ''; label: string }[] = [
  { value: '', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'failed', label: 'Failed' },
]

export default function PostsPage() {
  const [platform, setPlatform] = useState<Platform | ''>('')
  const [status, setStatus] = useState<PostStatus | ''>('')
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery<PostsResponse>({
    queryKey: ['posts', platform, status, page],
    queryFn: () => api.get('/posts', {
      params: { platform: platform || undefined, status: status || undefined, page, limit: 12 }
    }).then(r => r.data),
  })

  const posts = data?.posts || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / 12)

  const filtered = search
    ? posts.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.caption?.toLowerCase().includes(search.toLowerCase())
      )
    : posts

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">{total} total posts</p>
        </div>
        <Link to="/posts/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search posts..."
              className="input pl-9"
            />
          </div>

          {/* Platform filter */}
          <select
            value={platform}
            onChange={e => { setPlatform(e.target.value as any); setPage(1) }}
            className="input w-auto"
          >
            {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>

          {/* Status filter */}
          <select
            value={status}
            onChange={e => { setStatus(e.target.value as any); setPage(1) }}
            className="input w-auto"
          >
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          {/* View toggle */}
          <div className="flex gap-1 bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Posts */}
      {isLoading ? (
        <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5">
              <div className="skeleton h-5 w-3/4 rounded-lg mb-3" />
              <div className="skeleton h-4 w-full rounded-lg mb-2" />
              <div className="skeleton h-4 w-2/3 rounded-lg mb-4" />
              <div className="skeleton h-24 rounded-xl mb-3" />
              <div className="flex gap-2">
                <div className="skeleton h-6 w-20 rounded-full" />
                <div className="skeleton h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <Filter className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No posts found</p>
          <p className="text-slate-500 text-sm mt-1">
            {search || platform || status ? 'Try adjusting your filters' : 'Create your first post to get started'}
          </p>
          {!search && !platform && !status && (
            <Link to="/posts/new" className="btn-primary mt-4 inline-flex">
              <Plus className="w-4 h-4" />
              Create Post
            </Link>
          )}
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(post => <PostListItem key={post.id} post={post} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary px-3 py-2 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-slate-400 text-sm px-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary px-3 py-2 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
