export type Platform = 'facebook' | 'tiktok' | 'both'
export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed' | 'cancelled'
export type MediaType = 'image' | 'video' | 'text'

export interface Post {
  id: string
  user_id: string
  title: string
  caption: string | null
  media_url: string | null
  media_type: MediaType | null
  media_path: string | null
  platform: Platform
  status: PostStatus
  scheduled_at: string | null
  published_at: string | null
  facebook_post_id: string | null
  tiktok_post_id: string | null
  error_message: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  username: string
  avatar?: string
  created_at?: string
}

export interface PlatformConnection {
  id: string
  platform: 'facebook' | 'tiktok'
  page_name: string | null
  page_id: string | null
  is_connected: number
  expires_at: string | null
  created_at: string
}

export interface Stats {
  total: number
  scheduled: number
  published: number
  draft: number
  failed: number
  facebook: number
  tiktok: number
  recentActivity: { date: string; count: number }[]
}

export interface PostsResponse {
  posts: Post[]
  total: number
  page: number
  limit: number
}
