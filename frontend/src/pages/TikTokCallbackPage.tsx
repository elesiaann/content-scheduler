import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Music2, CheckCircle, XCircle, Loader } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function TikTokCallbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Connecting your TikTok account...')

  useEffect(() => {
    const code = params.get('code')
    const error = params.get('error')

    if (error || !code) {
      setStatus('error')
      setMessage('TikTok authorization was denied or cancelled.')
      setTimeout(() => navigate('/settings'), 3000)
      return
    }

    api.post('/platforms/tiktok/callback', { code })
      .then(res => {
        const { access_token, refresh_token } = res.data
        return api.post('/platforms/tiktok/connect', { access_token, refresh_token })
      })
      .then(() => {
        setStatus('success')
        setMessage('TikTok connected successfully!')
        toast.success('TikTok connected!')
        setTimeout(() => navigate('/settings'), 2000)
      })
      .catch(err => {
        setStatus('error')
        setMessage(err.response?.data?.error || 'Failed to connect TikTok.')
        setTimeout(() => navigate('/settings'), 3000)
      })
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="card p-10 text-center max-w-sm w-full mx-4">
        <div className="w-16 h-16 tiktok-gradient rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Music2 className="w-8 h-8 text-white" />
        </div>

        {status === 'loading' && (
          <Loader className="w-8 h-8 text-pink-400 animate-spin mx-auto mb-4" />
        )}
        {status === 'success' && (
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-4" />
        )}
        {status === 'error' && (
          <XCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
        )}

        <h2 className="text-lg font-semibold text-white mb-2">
          {status === 'loading' ? 'Connecting TikTok' : status === 'success' ? 'Connected!' : 'Connection Failed'}
        </h2>
        <p className="text-slate-400 text-sm">{message}</p>
        <p className="text-slate-600 text-xs mt-3">Redirecting to Settings...</p>
      </div>
    </div>
  )
}
