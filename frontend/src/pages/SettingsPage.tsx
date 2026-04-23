import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Facebook, Music2, Link, Unlink, ExternalLink, CheckCircle, AlertCircle, Key, User, Shield } from 'lucide-react'
import api from '../utils/api'
import { PlatformConnection } from '../types'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

function ConnectModal({ platform, onClose, onConnect }: {
  platform: 'facebook' | 'tiktok'
  onClose: () => void
  onConnect: (data: any) => void
}) {
  const [accessToken, setAccessToken] = useState('')
  const [pageId, setPageId] = useState('')
  const [pageName, setPageName] = useState('')
  const [refreshToken, setRefreshToken] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    if (!accessToken.trim()) {
      toast.error('Access token is required')
      return
    }
    setIsConnecting(true)
    try {
      await onConnect({ access_token: accessToken, page_id: pageId, page_name: pageName, refresh_token: refreshToken })
      onClose()
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-lg p-6 animate-slide-in">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 ${platform === 'facebook' ? 'bg-blue-600/20' : 'bg-pink-600/20'} rounded-xl flex items-center justify-center`}>
            {platform === 'facebook'
              ? <Facebook className="w-5 h-5 text-blue-400" />
              : <Music2 className="w-5 h-5 text-pink-400" />
            }
          </div>
          <div>
            <h3 className="font-semibold text-white">Connect {platform === 'facebook' ? 'Facebook' : 'TikTok'}</h3>
            <p className="text-xs text-slate-400">Enter your API credentials</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Access Token *</label>
            <input
              type="password"
              value={accessToken}
              onChange={e => setAccessToken(e.target.value)}
              placeholder={platform === 'facebook' ? 'Facebook Page Access Token' : 'TikTok Access Token'}
              className="input"
            />
          </div>

          {platform === 'facebook' && (
            <>
              <div>
                <label className="label">Page ID</label>
                <input
                  type="text"
                  value={pageId}
                  onChange={e => setPageId(e.target.value)}
                  placeholder="Your Facebook Page ID"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Page Name</label>
                <input
                  type="text"
                  value={pageName}
                  onChange={e => setPageName(e.target.value)}
                  placeholder="Your Facebook Page Name"
                  className="input"
                />
              </div>
            </>
          )}

          {platform === 'tiktok' && (
            <div>
              <label className="label">Refresh Token</label>
              <input
                type="password"
                value={refreshToken}
                onChange={e => setRefreshToken(e.target.value)}
                placeholder="TikTok Refresh Token (optional)"
                className="input"
              />
            </div>
          )}

          <div className={`p-4 rounded-xl ${platform === 'facebook' ? 'bg-blue-600/10 border border-blue-600/20' : 'bg-pink-600/10 border border-pink-600/20'}`}>
            <p className="text-xs text-slate-400 leading-relaxed">
              {platform === 'facebook' ? (
                <>
                  <strong className="text-blue-400">How to get your token:</strong><br />
                  1. Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Facebook Developer Console</a><br />
                  2. Create an app with Pages API access<br />
                  3. Generate a Page Access Token with <code className="bg-slate-800 px-1 rounded">pages_manage_posts</code> permission<br />
                  4. Find your Page ID in your Facebook Page settings
                </>
              ) : (
                <>
                  <strong className="text-pink-400">How to get your token:</strong><br />
                  1. Go to <a href="https://developers.tiktok.com" target="_blank" rel="noopener noreferrer" className="text-pink-400 underline">TikTok Developer Portal</a><br />
                  2. Create an app and get credentials<br />
                  3. Complete OAuth flow to get access token<br />
                  4. Ensure <code className="bg-slate-800 px-1 rounded">video.publish</code> scope is enabled
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">
            Cancel
          </button>
          <button
            onClick={handleConnect}
            disabled={isConnecting || !accessToken.trim()}
            className={`flex-1 justify-center font-medium px-4 py-2 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 ${
              platform === 'facebook'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-pink-600 hover:bg-pink-700 text-white'
            }`}
          >
            {isConnecting ? 'Connecting...' : 'Connect'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showConnect, setShowConnect] = useState<'facebook' | 'tiktok' | null>(null)

  const { data } = useQuery({
    queryKey: ['platforms'],
    queryFn: () => api.get('/platforms').then(r => r.data),
  })

  const connections: PlatformConnection[] = data?.connections || []
  const fbConn = connections.find(c => c.platform === 'facebook')
  const ttConn = connections.find(c => c.platform === 'tiktok')

  const handleConnect = async (platform: 'facebook' | 'tiktok', data: any) => {
    try {
      await api.post(`/platforms/${platform}/connect`, data)
      queryClient.invalidateQueries({ queryKey: ['platforms'] })
      toast.success(`${platform === 'facebook' ? 'Facebook' : 'TikTok'} connected successfully!`)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Connection failed')
      throw err
    }
  }

  const handleDisconnect = async (platform: 'facebook' | 'tiktok') => {
    if (!confirm(`Disconnect ${platform}? Your scheduled posts won't be published to this platform.`)) return
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
      {/* Account info */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <User className="w-5 h-5 text-primary-400" />
          <h3 className="font-semibold text-white">Account</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-600/20 border border-primary-600/30 rounded-2xl flex items-center justify-center">
            <span className="text-primary-400 font-bold text-2xl">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-white text-lg">{user?.username}</p>
            <p className="text-slate-400 text-sm">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Platform connections */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <Link className="w-5 h-5 text-primary-400" />
          <div>
            <h3 className="font-semibold text-white">Connected Platforms</h3>
            <p className="text-slate-400 text-xs mt-0.5">Connect your social accounts to start publishing</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Facebook */}
          <div className={`p-4 rounded-xl border ${fbConn?.is_connected ? 'border-blue-600/30 bg-blue-600/5' : 'border-slate-700'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 facebook-gradient rounded-xl flex items-center justify-center">
                  <Facebook className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">Facebook</p>
                  {fbConn?.is_connected ? (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-xs text-green-400">
                        Connected{fbConn.page_name ? ` — ${fbConn.page_name}` : ''}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs text-slate-500">Not connected</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {fbConn?.is_connected ? (
                  <button
                    onClick={() => handleDisconnect('facebook')}
                    className="btn-danger text-sm px-3 py-1.5"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConnect('facebook')}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-xl transition-all flex items-center gap-2"
                  >
                    <Link className="w-3.5 h-3.5" />
                    Connect
                  </button>
                )}
              </div>
            </div>

            {fbConn?.is_connected && (
              <div className="mt-3 pt-3 border-t border-slate-800 flex gap-4 text-xs text-slate-500">
                {fbConn.page_id && <span>Page ID: <span className="text-slate-300">{fbConn.page_id}</span></span>}
              </div>
            )}
          </div>

          {/* TikTok */}
          <div className={`p-4 rounded-xl border ${ttConn?.is_connected ? 'border-pink-600/30 bg-pink-600/5' : 'border-slate-700'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 tiktok-gradient rounded-xl flex items-center justify-center relative overflow-hidden">
                  <Music2 className="w-6 h-6 text-white relative z-10" />
                  <div className="absolute -right-1 -top-1 w-5 h-5 bg-tiktok-cyan/30 rounded-full blur-sm" />
                  <div className="absolute -left-1 -bottom-1 w-5 h-5 bg-tiktok-pink/30 rounded-full blur-sm" />
                </div>
                <div>
                  <p className="font-semibold text-white">TikTok</p>
                  {ttConn?.is_connected ? (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-xs text-green-400">Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs text-slate-500">Not connected</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {ttConn?.is_connected ? (
                  <button
                    onClick={() => handleDisconnect('tiktok')}
                    className="btn-danger text-sm px-3 py-1.5"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConnect('tiktok')}
                    className="bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium px-4 py-1.5 rounded-xl transition-all flex items-center gap-2"
                  >
                    <Link className="w-3.5 h-3.5" />
                    Connect
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Info */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-5 h-5 text-primary-400" />
          <h3 className="font-semibold text-white">API Configuration</h3>
        </div>
        <div className="space-y-3 text-sm text-slate-400">
          <div className="p-3 bg-slate-800 rounded-xl">
            <p className="font-medium text-slate-200 mb-1">Backend Configuration</p>
            <p>Configure your <code className="bg-slate-700 px-1 rounded text-xs">backend/.env</code> file with:</p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• <code className="text-primary-300">FACEBOOK_APP_ID</code> and <code className="text-primary-300">FACEBOOK_APP_SECRET</code></li>
              <li>• <code className="text-primary-300">TIKTOK_CLIENT_KEY</code> and <code className="text-primary-300">TIKTOK_CLIENT_SECRET</code></li>
              <li>• <code className="text-primary-300">JWT_SECRET</code> — a strong random string</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-primary-400" />
          <h3 className="font-semibold text-white">Security</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-800 rounded-xl">
            <div>
              <p className="text-sm font-medium text-slate-200">Session</p>
              <p className="text-xs text-slate-500">JWT token expires in 7 days</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Connect modal */}
      {showConnect && (
        <ConnectModal
          platform={showConnect}
          onClose={() => setShowConnect(null)}
          onConnect={(data) => handleConnect(showConnect, data)}
        />
      )}
    </div>
  )
}
