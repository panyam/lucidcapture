import { Link } from 'react-router'
import { MaterialIcon } from '../components/shared/MaterialIcon'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-8 pt-24 pb-32 max-w-[1920px] mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-on-background leading-[1.05]">
            Turn your product into{' '}
            <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
              Cinematic Experiences.
            </span>
          </h1>
          <p className="text-lg text-slate-500 mt-8 max-w-xl mx-auto leading-relaxed">
            Record, edit, and share interactive product demos that captivate your audience. No video editing skills required.
          </p>
          <div className="flex items-center justify-center gap-4 mt-10">
            <Link
              to="/dashboard"
              className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-8 py-3.5 rounded-full font-semibold shadow-lg hover:shadow-primary/20 transition-all active:scale-95 duration-200 flex items-center gap-2"
            >
              <MaterialIcon icon="videocam" filled size="20px" />
              Start Recording — Free
            </Link>
            <a
              href="#features"
              className="bg-surface-container-highest text-on-primary-fixed-variant px-8 py-3.5 rounded-full font-semibold hover:bg-surface-container-high transition-colors"
            >
              See How It Works
            </a>
          </div>
        </div>

        {/* Hero Visual Placeholder */}
        <div className="mt-16 max-w-4xl mx-auto rounded-2xl bg-surface-container-low shadow-[0_48px_80px_-4px_rgba(20,27,43,0.08)] overflow-hidden aspect-video flex items-center justify-center">
          <div className="text-center text-slate-400">
            <MaterialIcon icon="play_circle" size="64px" />
            <p className="mt-4 text-sm font-medium">Interactive Demo Preview</p>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="px-8 py-24 max-w-[1920px] mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Engineered for Precision</p>
          <h2 className="text-4xl font-black tracking-tighter text-on-background">
            Everything you need to create stunning demos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Feature Card: One-Click Recording */}
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_32px_64px_-4px_rgba(20,27,43,0.04)]">
            <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center mb-6">
              <MaterialIcon icon="radio_button_checked" className="text-primary" />
            </div>
            <h3 className="text-xl font-bold text-on-background mb-3">One-Click Recording</h3>
            <p className="text-slate-500 leading-relaxed">
              Capture every click, scroll, and interaction with our lightweight browser extension.
            </p>
          </div>

          {/* Feature Card: Seamless Sharing */}
          <div className="bg-gradient-to-br from-primary to-primary-container rounded-xl p-8 text-white">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-6">
              <MaterialIcon icon="share" className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Seamless Sharing</h3>
            <p className="text-white/80 leading-relaxed">
              Export as a single HTML file. Share via link, embed on your site, or download.
            </p>
          </div>

          {/* Feature Card: Interactive Annotations */}
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_32px_64px_-4px_rgba(20,27,43,0.04)]">
            <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center mb-6">
              <MaterialIcon icon="edit_note" className="text-tertiary" />
            </div>
            <h3 className="text-xl font-bold text-on-background mb-3">Interactive Annotations</h3>
            <p className="text-slate-500 leading-relaxed">
              Add hotspots, tooltips, and callouts to guide viewers through every step.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-8 py-24">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary to-primary-container rounded-2xl p-16 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">
            Ready to showcase your genius?
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of product teams creating demos that convert.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3.5 rounded-full font-semibold shadow-lg hover:shadow-white/20 transition-all active:scale-95 duration-200"
          >
            Get Started Free
            <MaterialIcon icon="arrow_forward" size="20px" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-12 bg-surface-container-low">
        <div className="max-w-[1920px] mx-auto flex justify-between items-center">
          <span className="text-lg font-black tracking-tighter text-slate-400">Lucid Capture</span>
          <p className="text-xs text-slate-400">&copy; 2026 Lucid Capture. Built with Stitch + Claude.</p>
        </div>
      </footer>
    </div>
  )
}
