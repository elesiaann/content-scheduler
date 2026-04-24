import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Facebook, Music2, Link, Unlink, CheckCircle,
  AlertCircle, Shield, ExternalLink, RefreshCw
} from 'lucide-react'
import api from '../utils/api'
import { PlatformConnection } from '../types'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [connecting, setConnecting] = useState<'facebook' | 'tiktok' | null>(null)

  const { data } = useQuery({
    queryKey: ['platforms'],
    queryFn: () => api.get('/platforms').then(r => r.data),
  })

  const connections: PlatformConnection[] = data?.connections || []
  const fbConn = connections.find(c => c.platform === 'facebook')
  const ttConn = connections.find(c => c.platform === 'tiktok')

  const handleTikTokConnect = async () => {
    setConnecting('tiktok')
    try {
      const res = await api.get('/platforms/tiktok/oauth-url')
      if (res.data?.url) {
        // Open in same tab — standard OAuth flow
        window.location.assign(res.data.url)
      } else {
        toast.error('No redirect URL returned from server')
        setConnecting(null)
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'TikTok credentials (TIKTOK_CLIENT_KEY) are not configured yet'
      toast.error(msg)
      setConnecting(null)
    }
  }

  const handleFacebookConnect = async () => {
    setConnecting('facebook')
    try {
      const res = await api.get('/platforms/facebook/oauth-url')
      if (res.data?.url) {
        window.location.assign(res.data.url)
      } else {
        toast.error('No redirect URL returned from server')
        setConnecting(null)
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Facebook credentials (FACEBOOK_APP_ID) are not configured yet'
      toast.error(msg)
      setConnecting(null)
    }
  }

  const handleDisconnect = async (platform: 'facebook' | 'tiktok') => {
    if (!confirm(`Disconnect ${platform}? Scheduled posts won't be published to this platform.`)) return
    try {
      await api.delete(`/platforms/${platform}`)
      queryClient.invalidateQueries({ queryKey: ['platforms'] })
      toast.success(`${platform} disconnected`)
    } catch {
      toast.error('Failed to disconnect')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">

      {/* Platform connections */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-2">
          <Link className="w-5 h-5 text-primary-400" />
          <h3 className="font-semibold text-white">Connected Platforms</h3>
        </div>
        <p className="text-slate-400 text-sm mb-6">
          Connect your social accounts to schedule and auto-publish content.
        </p>

        <div className="space-y-4">

          {/* TikTok */}
          <div className={`p-5 rounded-xl border transition-all ${ttConn?.is_connected ? 'border-pink-600/40 bg-pink-600/5' : 'border-slate-700 bg-slate-800/30'}`}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 tiktok-gradient rounded-2xl flex items-center justify-center relative overflow-hidden flex-shrink-0 shadow-lg">
                  <Music2 className="w-7 h-7 text-white relative z-10" />
                  <div className="absolute -right-1 -top-1 w-6 h-6 bg-cyan-400/30 rounded-full blur-sm" />
                  <div className="absolute -left-1 -bottom-1 w-6 h-6 bg-rose-500/30 rounded-full blur-sm" />
                </div>
                <div>
                  <p className="font-bold text-white text-base">TikTok</p>
                  {ttConn?.is_connected ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-xs text-green-400 font-medium">Account connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs text-slate-500">Not connected</span>
                    </div>
                  )}
                </div>
              </div>

              {ttConn?.is_connected ? (
                <button
                  onClick={() => handleDisconnect('tiktok')}
                  className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 px-3 py-2 rounded-xl transition-all"
                >
                  <Unlink className="w-4 h-4" />
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={handleTikTokConnect}
                  disabled={connecting !== null}
                  className="flex items-center gap-2 bg-black hover:bg-slate-900 border border-slate-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-60 shadow-md"
                >
                  {connecting === 'tiktok'
                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                    : <Music2 className="w-4 h-4 text-rose-500" />
                  }
                  {connecting === 'tiktok' ? 'Redirecting to TikTok...' : 'Login with TikTok'}
                  {connecting !== 'tiktok' && <ExternalLink className="w-3 h-3 text-slate-400" />}
                </button>
              )}
            </div>

            {!ttConn?.is_connected && (
              <p className="mt-4 text-xs text-slate-500 pt-4 border-t border-slate-700/50">
                You'll be redirected to TikTok to authorize this app. Permissions: <code className="bg-slate-800 px-1 rounded">video.publish</code> <code className="bg-slate-800 px-1 rounded">video.upload</code>
              </p>
            )}
          </div>

          {/* Facebook */}
          <div className={`p-5 rounded-xl border transition-all ${fbConn?.is_connected ? 'border-blue-600/40 bg-blue-600/5' : 'border-slate-700 bg-slate-800/30'}`}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 facebook-gradient rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Facebook className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-base">Facebook</p>
                  {fbConn?.is_connected ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-xs text-green-400 font-medium">
                        {fbConn.page_name ? `Page: ${fbConn.page_name}` : 'Account connected'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs text-slate-500">Not connected</span>
                    </div>
                  )}
                </div>
              </div>

              {fbConn?.is_connected ? (
                <button
                  onClick={() => handleDisconnect('facebook')}
                  className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 px-3 py-2 rounded-xl transition-all"
                >
                  <Unlink className="w-4 h-4" />
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={handleFacebookConnect}
                  disabled={connecting !== null}
                  className="flex items-center gap-2 bg-[#1877f2] hover:bg-[#1565c0] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-60 shadow-md"
                >
                  {connecting === 'facebook'
                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                    : <Facebook className="w-4 h-4" />
                  }
                  {connecting === 'facebook' ? 'Redirecting to Facebook...' : 'Continue with Facebook'}
                  {connecting !== 'facebook' && <ExternalLink className="w-3 h-3 opacity-70" />}
                </button>
              )}
            </div>

            {!fbConn?.is_connected && (
              <p className="mt-4 text-xs text-slate-500 pt-4 border-t border-slate-700/50">
                You'll be redirected to Facebook to authorize this app. Permissions: <code className="bg-slate-800 px-1 rounded">pages_manage_posts</code> <code className="bg-slate-800 px-1 rounded">pages_read_engagement</code>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-primary-400" />
          <h3 className="font-semibold text-white">Security & Privacy</h3>
        </div>
        <div className="space-y-3 text-sm text-slate-400">
          {[
            'Your access tokens are stored securely and only used to publish content on your behalf.',
            'We never sell or share your credentials with third parties.',
            'You can disconnect any platform at any time from this page.',
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
