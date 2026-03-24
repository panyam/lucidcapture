import { Link } from 'react-router'
import { MaterialIcon } from '../components/shared/MaterialIcon'
import { Footer } from '../components/shared/Footer'

export function LandingCompactPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Hero — with badge and inline CTAs */}
      <section className="relative overflow-hidden px-8 pt-24 pb-16 max-w-[1920px] mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low ghost-border mb-6">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary">New Release</span>
            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
            <span className="text-[11px] font-medium text-on-surface-variant">v2.0 Cinematic Scenes</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-on-background leading-[1.05] mb-6">
            Turn your product into{' '}
            <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
              Cinematic Experiences.
            </span>
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed mb-8">
            Record, edit, and share interactive product demos that captivate your audience. No video editing skills required.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/dashboard" className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-8 py-3.5 rounded-full font-semibold shadow-lg hover:shadow-primary/20 transition-all active:scale-95 duration-200">
              Start Recording for Free
            </Link>
            <a href="#features" className="bg-surface-container-highest text-on-primary-fixed-variant px-6 py-3.5 rounded-full font-semibold hover:bg-surface-container-high transition-colors flex items-center gap-2">
              <MaterialIcon icon="play_circle" size="20px" />
              See it in action
            </a>
          </div>
        </div>
      </section>

      {/* Trust Logos */}
      <section className="px-8 py-8 max-w-[1920px] mx-auto">
        <div className="text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Trusted by teams at</p>
          <div className="flex items-center justify-center gap-12 text-slate-300 text-lg font-black tracking-tighter">
            <span>VELOCITY</span><span>NEXUS</span><span>ORBIT</span><span>PRISM</span><span>FLUX</span>
          </div>
        </div>
      </section>

      {/* Features — stacked list */}
      <section id="features" className="px-8 py-24 max-w-[1920px] mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Engineered for Precision</p>
          <h2 className="text-4xl font-black tracking-tighter text-on-background">Everything you need to create stunning demos</h2>
        </div>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_32px_64px_-4px_rgba(20,27,43,0.04)] flex gap-8 items-start">
            <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center flex-shrink-0">
              <MaterialIcon icon="radio_button_checked" className="text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-on-background mb-2">One-Click Recording</h3>
              <p className="text-slate-500 leading-relaxed">Capture every click, scroll, and interaction with our lightweight browser extension. Just hit record and navigate — we handle the rest.</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary to-primary-container rounded-xl p-8 text-white flex gap-8 items-start">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <MaterialIcon icon="share" className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Seamless Sharing</h3>
              <p className="text-white/80 leading-relaxed">Export as a single HTML file. Share via link, embed on your site, or download. Zero dependencies — works from file://.</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_32px_64px_-4px_rgba(20,27,43,0.04)] flex gap-8 items-start">
            <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center flex-shrink-0">
              <MaterialIcon icon="edit_note" className="text-tertiary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-on-background mb-2">Interactive Annotations</h3>
              <p className="text-slate-500 leading-relaxed">Add hotspots, tooltips, and callouts to guide viewers through every step of your demo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA — dual buttons */}
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

      <Footer />
    </div>
  )
}
