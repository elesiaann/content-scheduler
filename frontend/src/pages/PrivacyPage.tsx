import { Link } from 'react-router-dom'
import { Zap, ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">ContentFlow</span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-slate-400">Last updated: April 23, 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-slate-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
            <p>ContentFlow ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard information when you use our social media content scheduling service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>
            <p>We collect only the information necessary to provide the Service:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-slate-400">
              <li><strong className="text-slate-300">Content Data:</strong> Posts, captions, media files, and hashtags you create within ContentFlow</li>
              <li><strong className="text-slate-300">Platform Tokens:</strong> Access tokens you provide to connect your TikTok and Facebook accounts</li>
              <li><strong className="text-slate-300">Schedule Data:</strong> Dates and times you set for post publishing</li>
              <li><strong className="text-slate-300">Usage Data:</strong> Basic information about how you interact with the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. How We Use Your Information</h2>
            <p>Your information is used solely to:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-slate-400">
              <li>Schedule and publish your content to connected social media platforms</li>
              <li>Display your scheduled posts and publishing history in the dashboard</li>
              <li>Authenticate with TikTok and Facebook on your behalf</li>
              <li>Improve the reliability and performance of the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. TikTok and Facebook Data</h2>
            <p>When you connect your TikTok or Facebook account to ContentFlow:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-slate-400">
              <li>We store your access token locally to enable publishing on your behalf</li>
              <li>We only request permissions necessary for content publishing</li>
              <li>We do not sell or share your social media credentials or data with third parties</li>
              <li>We access only the data required to publish content (page details, video upload permissions)</li>
              <li>You can revoke access at any time by disconnecting from the Settings page</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Data Storage and Security</h2>
            <p>Your data is stored securely. Access tokens are stored encrypted and are used exclusively for publishing actions you initiate. We do not retain data longer than necessary for the Service to function. Media files uploaded for scheduling are stored temporarily and may be deleted after publishing.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Data Sharing</h2>
            <p>We do not sell, rent, or share your personal data or content with third parties, except:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-slate-400">
              <li>With TikTok and Facebook APIs, solely to publish content on your behalf</li>
              <li>When required by law or legal process</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-slate-400">
              <li>Access the data stored about you within the Service</li>
              <li>Delete your posts and scheduled content at any time</li>
              <li>Disconnect your social media accounts from Settings</li>
              <li>Request deletion of all your data from ContentFlow</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Cookies</h2>
            <p>ContentFlow uses localStorage in your browser to store your session token. No third-party tracking cookies are used.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. The date at the top of this page reflects the most recent revision. Continued use of ContentFlow constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Contact Us</h2>
            <p>If you have any questions or concerns about this Privacy Policy or how your data is handled, please contact us through the ContentFlow platform.</p>
          </section>

        </div>
      </main>

      <footer className="border-t border-slate-800 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-6 flex gap-6 text-sm text-slate-500">
          <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
          <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  )
}
