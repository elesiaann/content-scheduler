import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X, Image, Video, Facebook, Music2, Globe, Clock, Tag, FileText } from 'lucide-react'
import { Post, Platform, PostStatus } from '../types'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'

interface PostFormProps {
  initialData?: Post
  mode: 'create' | 'edit'
}

export default function PostForm({ initialData, mode }: PostFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(initialData?.title || '')
  const [caption, setCaption] = useState(initialData?.caption || '')
  const [platform, setPlatform] = useState<Platform>(initialData?.platform || 'facebook')
  const [status, setStatus] = useState<PostStatus>(initialData?.status || 'draft')
  const [scheduledAt, setScheduledAt] = useState(
    initialData?.scheduled_at
      ? format(new Date(initialData.scheduled_at), "yyyy-MM-dd'T'HH:mm")
      : ''
  )
  const [mediaUrl, setMediaUrl] = useState(initialData?.media_url || '')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string>(
    initialData?.media_path ? `/uploads/${initialData.media_path}` :
    initialData?.media_url || ''
  )
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = (file: File) => {
    setMediaFile(file)
    setMediaUrl('')
    const reader = new FileReader()
    reader.onload = (e) => setMediaPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '')
    if (t && !tags.includes(t)) {
      setTags([...tags, t])
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag))

  const handleSubmit = async (e: React.FormEvent, submitStatus?: PostStatus) => {
    e.preventDefault()
    const finalStatus = submitStatus || status

    if (finalStatus === 'scheduled' && !scheduledAt) {
      toast.error('Please select a scheduled time')
      return
    }

    if (finalStatus === 'scheduled' && new Date(scheduledAt) <= new Date()) {
      toast.error('Scheduled time must be in the future')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('caption', caption)
      formData.append('platform', platform)
      formData.append('status', finalStatus)
      if (scheduledAt) formData.append('scheduled_at', new Date(scheduledAt).toISOString())
      if (mediaUrl && !mediaFile) formData.append('media_url', mediaUrl)
      if (mediaFile) formData.append('media', mediaFile)
      if (tags.length > 0) formData.append('tags', tags.join(','))

      if (mode === 'create') {
        await api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success(finalStatus === 'scheduled' ? 'Post scheduled!' : 'Post saved as draft!')
      } else {
        await api.put(`/posts/${initialData!.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Post updated!')
      }

      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['upcoming'] })
      navigate('/posts')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const charCount = caption.length
  const CAPTION_LIMITS = { facebook: 63206, tiktok: 2200, both: 2200 }
  const limit = CAPTION_LIMITS[platform]

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div className="card p-5">
            <label className="label">Post Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Give your post a descriptive title..."
              required
              className="input"
            />
          </div>

          {/* Caption */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0">Caption</label>
              <span className={`text-xs ${charCount > limit ? 'text-red-400' : 'text-slate-500'}`}>
                {charCount}/{limit}
              </span>
            </div>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder={`Write your ${platform === 'tiktok' ? 'TikTok' : platform === 'facebook' ? 'Facebook' : ''} caption here...`}
              rows={5}
              className="input resize-none"
            />
            <p className="text-xs text-slate-500 mt-2">
              Tip: Use emojis and hashtags to boost engagement
            </p>
          </div>

          {/* Media upload */}
          <div className="card p-5">
            <label className="label">Media (Image or Video)</label>

            {mediaPreview ? (
              <div className="relative rounded-xl overflow-hidden bg-slate-800">
                {mediaFile?.type.startsWith('video/') || (initialData?.media_type === 'video' && !mediaFile) ? (
                  <video src={mediaPreview} controls className="w-full max-h-64 object-cover" />
                ) : (
                  <img src={mediaPreview} alt="Preview" className="w-full max-h-64 object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => { setMediaPreview(''); setMediaFile(null); setMediaUrl('') }}
                  className="absolute top-2 right-2 bg-slate-900/80 text-slate-300 hover:text-white p-1.5 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-primary-500 bg-primary-600/10'
                    : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                    <Upload className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-slate-300 font-medium text-sm">Drop media here or click to browse</p>
                    <p className="text-slate-500 text-xs mt-1">Images: JPG, PNG, GIF • Videos: MP4, MOV (max 100MB)</p>
                  </div>
                  <div className="flex gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Image className="w-3 h-3" /> Images</span>
                    <span className="flex items-center gap-1"><Video className="w-3 h-3" /> Videos</span>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                />
              </div>
            )}

            {/* Media URL option */}
            {!mediaFile && !mediaPreview && (
              <div className="mt-3">
                <label className="label text-xs">Or paste a media URL</label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={e => { setMediaUrl(e.target.value); setMediaPreview(e.target.value) }}
                  placeholder="https://example.com/image.jpg"
                  className="input text-sm"
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="card p-5">
            <label className="label">Hashtags</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                placeholder="Add hashtag and press Enter..."
                className="input flex-1"
              />
              <button type="button" onClick={addTag} className="btn-secondary">
                <Tag className="w-4 h-4" />
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span key={i} className="flex items-center gap-1 bg-primary-600/20 text-primary-300 border border-primary-600/30 px-2.5 py-1 rounded-full text-sm">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-5">
          {/* Platform */}
          <div className="card p-5">
            <label className="label">Platform *</label>
            <div className="space-y-2">
              {[
                { value: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-400', bg: 'bg-blue-600/20', border: 'border-blue-600/40' },
                { value: 'tiktok', label: 'TikTok', icon: Music2, color: 'text-pink-400', bg: 'bg-pink-600/20', border: 'border-pink-600/40' },
                { value: 'both', label: 'Both Platforms', icon: Globe, color: 'text-purple-400', bg: 'bg-purple-600/20', border: 'border-purple-600/40' },
              ].map(({ value, label, icon: Icon, color, bg, border }) => (
                <label
                  key={value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                    platform === value
                      ? `${bg} ${border}`
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="platform"
                    value={value}
                    checked={platform === value}
                    onChange={() => setPlatform(value as Platform)}
                    className="sr-only"
                  />
                  <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <span className={`text-sm font-medium ${platform === value ? 'text-white' : 'text-slate-300'}`}>
                    {label}
                  </span>
                  {platform === value && (
                    <div className="ml-auto w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div className="card p-5">
            <label className="label">Schedule</label>
            <div className="space-y-3">
              <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${status === 'draft' ? 'border-slate-600 bg-slate-800/50' : 'border-slate-700 hover:border-slate-600'}`}>
                <input type="radio" name="status" value="draft" checked={status === 'draft'} onChange={() => setStatus('draft')} className="sr-only" />
                <FileText className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-200">Save as Draft</p>
                  <p className="text-xs text-slate-500">Post won't be published automatically</p>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${status === 'scheduled' ? 'border-primary-600/40 bg-primary-600/10' : 'border-slate-700 hover:border-slate-600'}`}>
                <input type="radio" name="status" value="scheduled" checked={status === 'scheduled'} onChange={() => setStatus('scheduled')} className="sr-only" />
                <Clock className="w-4 h-4 text-primary-400" />
                <div>
                  <p className="text-sm font-medium text-slate-200">Schedule Post</p>
                  <p className="text-xs text-slate-500">Auto-publish at specified time</p>
                </div>
              </label>
            </div>

            {status === 'scheduled' && (
              <div className="mt-3">
                <label className="label text-xs">Date & Time *</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                  required={status === 'scheduled'}
                  className="input"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="card p-5 space-y-3">
            <button
              type="submit"
              disabled={isSubmitting || !title}
              className="btn-primary w-full justify-center"
            >
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Save Post' : 'Update Post'}
            </button>

            {mode === 'create' && status !== 'scheduled' && (
              <button
                type="button"
                onClick={(e) => handleSubmit(e as any, 'scheduled')}
                disabled={isSubmitting || !title || !scheduledAt}
                className="btn-secondary w-full justify-center"
              >
                <Clock className="w-4 h-4" />
                Schedule
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate('/posts')}
              className="w-full text-center text-sm text-slate-400 hover:text-slate-200 py-2 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
