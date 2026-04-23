import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import api from '../utils/api'
import { Post } from '../types'
import PostForm from '../components/PostForm'

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: post, isLoading } = useQuery<Post>({
    queryKey: ['post', id],
    queryFn: () => api.get(`/posts/${id}`).then(r => r.data),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48 rounded-xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400">Post not found</p>
        <button onClick={() => navigate('/posts')} className="btn-secondary mt-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Posts
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/posts')}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Post</h1>
          <p className="text-slate-400 text-sm mt-0.5 truncate">{post.title}</p>
        </div>
      </div>
      <PostForm mode="edit" initialData={post} />
    </div>
  )
}
