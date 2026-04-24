import { Link } from 'react-router-dom'
import { Zap, ArrowLeft } from 'lucide-react'

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold text-white mb-3">Terms of Service</h1>
          <p className="text-slate-400">Last updated: April 23, 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-slate-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using ContentFlow ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. ContentFlow is a social media content scheduling platform that allows users to schedule and publish content to TikTok and Facebook.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
            <p>ContentFlow provides tools to help users schedule, manage, and publish content to social media platforms including TikTok and Facebook. The Service includes a web-based dashboard, content calendar, post scheduling, and media management features.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. User Responsibilities</h2>
            <p>By using ContentFlow, you agree to:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-slate-400">
              <li>Comply with all applicable laws and regulations</li>
              <li>Comply with TikTok's and Facebook's terms of service and community guidelines</li>
              <li>Not publish content that is illegal, harmful, abusive, or infringing</li>
              <li>Not use the Service for spam, harassment, or misleading content</li>
              <li>Maintain the security of any credentials or tokens provided to the Service</li>
              <li>Take full responsibility for all content scheduled and published through the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Third-Party Platforms</h2>
            <p>ContentFlow integrates with third-party platforms including TikTok and Facebook. Your use of these platforms through ContentFlow is subject to their respective terms of service and privacy policies. ContentFlow is not responsible for the policies or actions of these third-party platforms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Intellectual Property</h2>
            <p>You retain ownership of all content you create and publish through ContentFlow. By using the Service, you grant ContentFlow a limited license to store and process your content solely for the purpose of delivering the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Disclaimer of Warranties</h2>
            <p>ContentFlow is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that the Service will be uninterrupted, error-free, or that posts will be published at exact scheduled times. Delays may occur due to third-party platform limitations.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Limitation of Liability</h2>
            <p>ContentFlow shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to loss of data, failed post publications, or account issues on third-party platforms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Modifications to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes your acceptance of the revised Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Contact</h2>
            <p>For questions about these Terms of Service, please contact us through the ContentFlow platform.</p>
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
