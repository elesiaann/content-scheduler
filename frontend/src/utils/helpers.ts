import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from 'date-fns'

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return format(date, 'MMM d, yyyy • h:mm a')
}

export function formatRelative(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isToday(date)) return `Today at ${format(date, 'h:mm a')}`
  if (isTomorrow(date)) return `Tomorrow at ${format(date, 'h:mm a')}`
  return formatDistanceToNow(date, { addSuffix: true })
}

export function isOverdue(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  return isPast(new Date(dateStr))
}

export const PLATFORM_COLORS = {
  facebook: { bg: 'bg-blue-600/20', text: 'text-blue-400', border: 'border-blue-600/30', solid: '#1877f2' },
  tiktok: { bg: 'bg-pink-600/20', text: 'text-pink-400', border: 'border-pink-600/30', solid: '#fe2c55' },
  both: { bg: 'bg-purple-600/20', text: 'text-purple-400', border: 'border-purple-600/30', solid: '#8b5cf6' },
}

export const STATUS_COLORS = {
  draft: { bg: 'bg-slate-600/20', text: 'text-slate-400', border: 'border-slate-600/30' },
  scheduled: { bg: 'bg-blue-600/20', text: 'text-blue-400', border: 'border-blue-600/30' },
  published: { bg: 'bg-green-600/20', text: 'text-green-400', border: 'border-green-600/30' },
  failed: { bg: 'bg-red-600/20', text: 'text-red-400', border: 'border-red-600/30' },
  cancelled: { bg: 'bg-yellow-600/20', text: 'text-yellow-400', border: 'border-yellow-600/30' },
}

export function truncate(str: string, len = 80): string {
  return str.length > len ? str.slice(0, len) + '...' : str
}
