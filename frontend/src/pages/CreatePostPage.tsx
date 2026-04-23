import PostForm from '../components/PostForm'

export default function CreatePostPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Create New Post</h1>
        <p className="text-slate-400 text-sm mt-1">Schedule content for TikTok and Facebook</p>
      </div>
      <PostForm mode="create" />
    </div>
  )
}
