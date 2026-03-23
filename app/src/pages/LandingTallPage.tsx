import { Link } from 'react-router'
import { MaterialIcon } from '../components/shared/MaterialIcon'

export function LandingTallPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Hero with dashboard preview */}
      <section className="relative overflow-hidden px-8 pt-24 pb-16 max-w-[1920px] mx-auto">
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
            <Link to="/dashboard" className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-8 py-3.5 rounded-full font-semibold shadow-lg hover:shadow-primary/20 transition-all active:scale-95 duration-200">
              Start Recording for Free
            </Link>
            <a href="#features" className="bg-surface-container-highest text-on-primary-fixed-variant px-6 py-3.5 rounded-full font-semibold hover:bg-surface-container-high transition-colors flex items-center gap-2">
              <MaterialIcon icon="play_circle" size="20px" />
              See it in action
            </a>
          </div>
        </div>
        {/* Dashboard Preview */}
        <div className="mt-16 max-w-5xl mx-auto rounded-2xl bg-inverse-surface shadow-[0_48px_80px_-4px_rgba(20,27,43,0.12)] overflow-hidden p-6">
          <div className="flex gap-4 mb-4">
            <div className="w-3 h-3 rounded-full bg-error/60"></div>
            <div className="w-3 h-3 rounded-full bg-tertiary-fixed-dim/60"></div>
            <div className="w-3 h-3 rounded-full bg-primary-fixed-dim/60"></div>
          </div>
          <div className="rounded-xl bg-surface-container-lowest/10 aspect-video flex items-center justify-center">
            <div className="text-center text-inverse-on-surface/60">
              <MaterialIcon icon="dashboard" size="48px" />
              <p className="mt-2 text-sm font-medium">Your Scene Dashboard</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 1: Recording — white bg */}
      <section id="features" className="px-8 py-24 max-w-[1920px] mx-auto">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Capture</p>
            <h2 className="text-4xl font-black tracking-tighter text-on-background mb-6">One-Click Recording</h2>
            <p className="text-slate-500 leading-relaxed mb-6">
              Capture every click, scroll, and interaction with our lightweight browser extension. Just hit record and navigate your product — we capture screenshots, coordinates, and element labels automatically.
            </p>
            <div className="flex gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <MaterialIcon icon="check_circle" className="text-primary" size="18px" /> Cross-tab recording
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <MaterialIcon icon="check_circle" className="text-primary" size="18px" /> Auto screenshots
              </div>
            </div>
          </div>
          <div className="flex-1 bg-surface-container-low rounded-2xl aspect-video flex items-center justify-center">
            <div className="text-center text-slate-400">
              <MaterialIcon icon="radio_button_checked" size="48px" />
              <p className="mt-2 text-sm font-medium">Recording in progress</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 2: Annotations — tinted bg */}
      <section className="px-8 py-24 bg-surface-container-low">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row-reverse gap-16 items-center">
          <div className="flex-1">
            <p className="text-xs font-bold text-tertiary uppercase tracking-widest mb-4">Edit</p>
            <h2 className="text-4xl font-black tracking-tighter text-on-background mb-6">Interactive Annotations</h2>
            <p className="text-slate-500 leading-relaxed mb-6">
              Add hotspots, tooltips, and callouts to guide viewers through every step. Drag to reposition, edit timing, and customize transitions — all in a visual editor.
            </p>
            <div className="flex gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <MaterialIcon icon="check_circle" className="text-tertiary" size="18px" /> Drag hotspots
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <MaterialIcon icon="check_circle" className="text-tertiary" size="18px" /> Custom timing
              </div>
            </div>
          </div>
          <div className="flex-1 bg-surface-container-lowest rounded-2xl aspect-video flex items-center justify-center shadow-[0_32px_64px_-4px_rgba(20,27,43,0.04)]">
            <div className="text-center text-slate-400">
              <MaterialIcon icon="edit_note" size="48px" />
              <p className="mt-2 text-sm font-medium">Step editor with hotspot</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 3: Sharing — dark bg */}
      <section className="px-8 py-24 bg-inverse-surface">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1">
            <p className="text-xs font-bold text-primary-fixed uppercase tracking-widest mb-4">Share</p>
            <h2 className="text-4xl font-black tracking-tighter text-inverse-on-surface mb-6">Seamless Sharing</h2>
            <p className="text-inverse-on-surface/70 leading-relaxed mb-6">
              Export as a single HTML file — zero dependencies, works from file://. Share via link, embed on your site, or download. Your demo plays anywhere.
            </p>
            <a href="#" className="inline-flex items-center gap-2 bg-white/20 text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-white/30 transition-colors">
              <MaterialIcon icon="link" size="16px" /> Copy Share Link
            </a>
          </div>
          <div className="flex-1 bg-white/5 rounded-2xl aspect-video flex items-center justify-center">
            <div className="text-center text-inverse-on-surface/40">
              <MaterialIcon icon="share" size="48px" />
              <p className="mt-2 text-sm font-medium">Single HTML export</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cloud Rendering teaser */}
      <section className="px-8 py-16 max-w-[1920px] mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-fixed flex items-center justify-center mx-auto mb-6">
            <MaterialIcon icon="cloud" className="text-primary" size="28px" />
          </div>
          <h3 className="text-2xl font-black tracking-tight text-on-background mb-3">Cloud Rendering</h3>
          <p className="text-slate-500 leading-relaxed">Coming soon — render scenes in the cloud for instant sharing without file downloads.</p>
        </div>
      </section>

      {/* Trust Logos */}
      <section className="px-8 py-12 bg-surface-container-low">
        <div className="text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Trusted by teams at</p>
          <div className="flex items-center justify-center gap-12 text-slate-300 text-lg font-black tracking-tighter">
            <span>VELOCITY</span><span>NEXUS</span><span>ORBIT</span><span>PRISM</span><span>FLUX</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-24">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary to-primary-container rounded-2xl p-16 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">Ready to showcase your genius?</h2>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">Join thousands of product teams creating demos that convert.</p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/dashboard" className="bg-white text-primary px-8 py-3.5 rounded-full font-semibold shadow-lg hover:shadow-white/20 transition-all active:scale-95 duration-200">
              Start Recording for Free
            </Link>
            <a href="#" className="bg-white/20 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-white/30 transition-colors">Talk to Sales</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-16 bg-surface-container-low">
        <div className="max-w-[1920px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <span className="text-lg font-black tracking-tighter text-on-background mb-4 block">Lucid Capture</span>
              <p className="text-sm text-slate-500 leading-relaxed">Create interactive product demos that captivate your audience.</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Product</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <a href="#features" className="block hover:text-primary transition-colors">Features</a>
                <a href="#" className="block hover:text-primary transition-colors">Showcase</a>
                <a href="#" className="block hover:text-primary transition-colors">Pricing</a>
                <a href="#" className="block hover:text-primary transition-colors">API</a>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Resources</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <a href="#" className="block hover:text-primary transition-colors">Documentation</a>
                <a href="#" className="block hover:text-primary transition-colors">Community</a>
                <a href="#" className="block hover:text-primary transition-colors">Guides</a>
                <a href="#" className="block hover:text-primary transition-colors">Help Center</a>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Company</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <a href="#" className="block hover:text-primary transition-colors">About</a>
                <a href="#" className="block hover:text-primary transition-colors">Careers</a>
                <a href="#" className="block hover:text-primary transition-colors">Privacy</a>
                <a href="#" className="block hover:text-primary transition-colors">Terms</a>
              </div>
            </div>
          </div>
          <div className="pt-8 flex justify-between items-center" style={{ borderTop: '1px solid rgba(197,197,217,0.3)' }}>
            <p className="text-xs text-slate-400">&copy; 2026 Lucid Capture. Built with Stitch + Claude.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
