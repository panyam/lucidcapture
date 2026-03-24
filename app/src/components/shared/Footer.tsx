import { Link } from 'react-router'

export function Footer() {
  return (
    <footer className="w-full bg-surface-container-low dark:bg-surface-container transition-colors">
      <div className="max-w-[1920px] mx-auto px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
          <div className="flex-shrink-0">
            <span className="text-lg font-black tracking-tighter text-on-background">Lucid Capture</span>
            <p className="mt-2 text-xs text-on-surface-variant max-w-[200px] leading-relaxed">
              Curating cinematic product experiences with invisible precision.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-16">
            <div className="flex flex-col gap-3">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-primary">Product</span>
              <nav className="flex flex-col gap-2">
                <Link to="/dashboard" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Scenes Library</Link>
                <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Showcase</a>
                <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Pricing</a>
              </nav>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-primary">Resources</span>
              <nav className="flex flex-col gap-2">
                <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Documentation</a>
                <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Community</a>
                <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Help Center</a>
              </nav>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-primary">Company</span>
              <nav className="flex flex-col gap-2">
                <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">About</a>
                <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Careers</a>
                <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Privacy</a>
                <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Terms</a>
              </nav>
            </div>
          </div>
        </div>
        <div className="pt-6 flex justify-between items-center" style={{ borderTop: '1px solid var(--color-outline-variant)' }}>
          <p className="text-xs text-on-surface-variant">&copy; 2026 Lucid Capture. Built with Stitch + Claude.</p>
        </div>
      </div>
    </footer>
  )
}
