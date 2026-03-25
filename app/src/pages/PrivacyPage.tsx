import { Footer } from '../components/shared/Footer'

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-32">
        <span className="inline-block bg-primary-container text-on-primary-container text-xs font-semibold px-3 py-1 rounded-full mb-6">Privacy Policy</span>
        <h1 className="text-5xl font-black tracking-tighter text-on-background mb-2">Lucid Capture</h1>
        <p className="text-sm text-on-surface-variant mb-12">Effective Date: March 21, 2026</p>

        <h2 className="text-lg font-black text-primary mt-8 mb-3">Overview</h2>
        <p className="text-sm text-on-surface-variant mb-3 leading-relaxed">Lucid Capture is a browser extension that captures screenshots and click interactions on web pages to create interactive demos. We are committed to user privacy and transparency.</p>

        <h2 className="text-lg font-black text-primary mt-8 mb-3">Data Collection</h2>
        <p className="text-sm text-on-surface-variant mb-3 leading-relaxed">Lucid Capture does <strong className="text-on-background">NOT</strong> collect, transmit, or store any user data on external servers. Specifically:</p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li className="text-sm text-on-surface-variant">No personal information is collected</li>
          <li className="text-sm text-on-surface-variant">No browsing history is tracked</li>
          <li className="text-sm text-on-surface-variant">No analytics or telemetry data is sent anywhere</li>
          <li className="text-sm text-on-surface-variant">No cookies are set</li>
          <li className="text-sm text-on-surface-variant">No third-party services are contacted</li>
        </ul>

        <h2 className="text-lg font-black text-primary mt-8 mb-3">Data Storage</h2>
        <p className="text-sm text-on-surface-variant mb-3 leading-relaxed">All captured data (screenshots, click coordinates, step metadata) is stored exclusively in your browser's local storage (IndexedDB and chrome.storage.local). This data never leaves your device unless you explicitly export and share it yourself.</p>

        <h2 className="text-lg font-black text-primary mt-8 mb-3">Permissions Explained</h2>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li className="text-sm text-on-surface-variant"><strong className="text-on-background">activeTab:</strong> Required to capture screenshots of the currently active tab during recording</li>
          <li className="text-sm text-on-surface-variant"><strong className="text-on-background">tabs:</strong> Required to identify the active tab for screenshot capture and to open the editor tab</li>
          <li className="text-sm text-on-surface-variant"><strong className="text-on-background">storage:</strong> Required to temporarily transfer captured steps from the extension to the editor</li>
          <li className="text-sm text-on-surface-variant"><strong className="text-on-background">scripting:</strong> Required to inject the click-capture script into pages during recording</li>
        </ul>

        <h2 className="text-lg font-black text-primary mt-8 mb-3">Data Sharing</h2>
        <p className="text-sm text-on-surface-variant mb-3 leading-relaxed">We do not share any data with third parties. There is no server component. The extension operates entirely within your browser.</p>

        <h2 className="text-lg font-black text-primary mt-8 mb-3">Data Deletion</h2>
        <p className="text-sm text-on-surface-variant mb-3 leading-relaxed">All locally stored data can be deleted by:</p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li className="text-sm text-on-surface-variant">Removing captured projects from the Lucid Capture editor</li>
          <li className="text-sm text-on-surface-variant">Uninstalling the extension (clears all chrome.storage.local data)</li>
          <li className="text-sm text-on-surface-variant">Clearing your browser's IndexedDB storage</li>
        </ul>

        <h2 className="text-lg font-black text-primary mt-8 mb-3">Changes to This Policy</h2>
        <p className="text-sm text-on-surface-variant mb-3 leading-relaxed">Any changes to this privacy policy will be reflected in an updated version of the extension and this document.</p>

        <h2 className="text-lg font-black text-primary mt-8 mb-3">Contact</h2>
        <p className="text-sm text-on-surface-variant mb-3 leading-relaxed">For privacy questions, open an issue at: <a href="https://github.com/panyam/lucidcapture/issues" className="text-primary hover:underline">github.com/panyam/lucidcapture/issues</a></p>
      </div>

      <Footer />
    </div>
  )
}
