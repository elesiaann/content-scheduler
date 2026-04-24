import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Facebook, CheckCircle, XCircle, Loader } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function FacebookCallbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Connecting your Facebook account...')

  useEffect(() => {
    const code = params.get('code')
    const error = params.get('error')

    if (error || !code) {
      setStatus('error')
      setMessage('Facebook authorization was denied or cancelled.')
      setTimeout(() => navigate('/settings'), 3000)
      return
    }

    api.post('/platforms/facebook/callback', { code })
      .then(res => {
        const { access_token, pages } = res.data
        // Use first page if available
        const page = pages?.[0]
        return api.post('/platforms/facebook/connect', {
          access_token: page?.access_token || access_token,
          page_id: page?.id || null,
          page_name: page?.name || null,
        })
      })
      .then(() => {
        setStatus('success')
        setMessage('Facebook connected successfully!')
        toast.success('Facebook connected!')
        setTimeout(() => navigate('/settings'), 2000)
      })
      .catch(err => {
        setStatus('error')
        setMessage(err.response?.data?.error || 'Failed to connect Facebook.')
        setTimeout(() => navigate('/settings'), 3000)
      })
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="card p-10 text-center max-w-sm w-full mx-4">
        <div className="w-16 h-16 facebook-gradient rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Facebook className="w-8 h-8 text-white" />
        </div>

        {status === 'loading' && (
          <Loader className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
        )}
        {status === 'success' && (
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-4" />
        )}
        {status === 'error' && (
          <XCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
        )}

        <h2 className="text-lg font-semibold text-white mb-2">
          {status === 'loading' ? 'Connecting Facebook' : status === 'success' ? 'Connected!' : 'Connection Failed'}
        </h2>
        <p className="text-slate-400 text-sm">{message}</p>
        <p className="text-slate-600 text-xs mt-3">Redirecting to Settings...</p>
      </div>
    </div>
  )
}
