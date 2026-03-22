# Chrome Web Store Listing

## Name
Lucid Capture — Interactive Demo Recorder

## Short Description (132 chars max)
Record step-by-step interactive demos of any website. Capture clicks, annotate steps, and export as shareable HTML walkthroughs.

## Detailed Description
Lucid Capture lets you create interactive product walkthroughs by recording your actions on any website.

**How it works:**
1. Click the Lucid Capture icon and hit "Start Recording"
2. Navigate and click through any website — each interaction is captured as a step with a screenshot
3. Click "Stop Recording" — your captured steps open in the Lucid Capture editor
4. Add annotations, adjust timing, and reorder steps
5. Export as a single self-contained HTML file that anyone can open

**Features:**
• One-click recording on any website
• Automatic screenshot capture at each step
• Click position tracking for interactive hotspot overlays
• Step-by-step editor with timeline
• Export as a single HTML file — no hosting required, works offline
• No account required — all data stays in your browser

**Use cases:**
• Create onboarding walkthroughs for new team members
• Document bug reproduction steps with visual proof
• Build interactive tutorials for product features
• Share step-by-step guides without recording video

**Privacy first:**
All data is stored locally in your browser using IndexedDB. No data is sent to any server. No analytics. No tracking. See our privacy policy for details.

Built with care using modern web standards (Manifest V3, TypeScript).

## Category
Productivity

## Language
English

## Store Icon
Use `icons/icon128.png` (already generated)

---

## Privacy Practices Tab

### Single Purpose Description
Lucid Capture records user-initiated click interactions on web pages as screenshots to create step-by-step interactive product demos.

### Permission Justifications

**activeTab:**
Required to capture a screenshot of the currently visible tab when the user clicks during a recording session. The extension calls `chrome.tabs.captureVisibleTab()` which requires activeTab permission. Screenshots are only taken while the user has explicitly started a recording session. No screenshots are taken in the background or without user action.

**tabs:**
Required to query the currently active tab ID so the extension can (1) send start/stop messages to the content script running in that tab, and (2) open a new tab pointing to the Lucid Capture editor when recording is complete. No tab URLs or browsing history are read, stored, or transmitted.

**scripting:**
Required to inject the click-capture content script into the active tab when the user starts recording. The injected script listens for click events to record their coordinates and the CSS selector of the clicked element. The script is only injected upon explicit user action (pressing "Start Recording") and is removed when recording stops. No scripts are injected without user consent.

**storage:**
Required to temporarily store captured step data (screenshots, click coordinates, page URLs) in `chrome.storage.local` so it can be transferred from the extension to the Lucid Capture web editor. Data is cleared immediately after the editor imports it. No data is synced to any server or cloud storage.

**Host permissions:**
This extension does not request broad host permissions. The content script uses `<all_urls>` in the manifest only so that the recording feature works on any website the user chooses to record. The content script does nothing unless the user explicitly starts a recording session.

**Remote code:**
This extension does NOT use any remote code. All JavaScript is bundled locally at build time using esbuild. No scripts are loaded from external servers. Source maps are included for verification.

### Data Use Certification
- [x] I certify that this extension's data usage complies with the Chrome Web Store Developer Program Policies
- The extension does not collect or transmit personally identifiable information
- The extension does not collect or transmit health, financial, authentication, personal communications, location, browsing history, or user activity data
- All data remains local to the user's browser

---

## Privacy Policy

**Privacy Policy URL:** https://panyam.github.io/lucidcapture/privacy.html

### Lucid Capture Privacy Policy

**Effective Date:** March 21, 2026

**Overview:**
Lucid Capture is a browser extension that captures screenshots and click interactions on web pages to create interactive demos. We are committed to user privacy and transparency.

**Data Collection:**
Lucid Capture does NOT collect, transmit, or store any user data on external servers. Specifically:
- No personal information is collected
- No browsing history is tracked
- No analytics or telemetry data is sent anywhere
- No cookies are set
- No third-party services are contacted

**Data Storage:**
All captured data (screenshots, click coordinates, step metadata) is stored exclusively in your browser's local storage (IndexedDB and chrome.storage.local). This data never leaves your device unless you explicitly export and share it yourself.

**Permissions Explained:**
- **activeTab:** Required to capture screenshots of the currently active tab during recording
- **tabs:** Required to identify the active tab for screenshot capture and to open the editor tab
- **storage:** Required to temporarily transfer captured steps from the extension to the editor
- **scripting:** Required to inject the click-capture script into pages during recording

**Data Sharing:**
We do not share any data with third parties. There is no server component. The extension operates entirely within your browser.

**Data Deletion:**
All locally stored data can be deleted by:
- Removing captured projects from the Lucid Capture editor
- Uninstalling the extension (clears all chrome.storage.local data)
- Clearing your browser's IndexedDB storage

**Changes to This Policy:**
Any changes to this privacy policy will be reflected in an updated version of the extension and this document.

**Contact:**
For privacy questions, open an issue at: https://github.com/panyam/lucidcapture/issues

---

## Screenshots Needed
1. **Popup UI** — showing the "Start Recording" state (280x280 or similar)
2. **Recording in progress** — badge showing "REC" + step count on a sample website
3. **Editor with captured steps** — showing screenshots, hotspot overlays, and timeline
4. **Dashboard** — showing multiple captured arcade projects
5. **Export flow** — the share modal or downloaded HTML file

Recommended size: 1280x800 or 640x400 (Chrome Web Store accepts both)

## Approval Checklist
- [x] Manifest V3 (required since 2024)
- [x] All permissions have justifications
- [x] Single purpose description provided
- [x] Privacy practices tab fields filled
- [x] No remote code execution (all JS bundled locally via esbuild)
- [x] Source maps included in build
- [x] Data use certification ready
- [ ] Contact email verified on Account tab
- [ ] Privacy policy URL live (deploy via `make gh-pages`)
- [ ] Screenshots taken (need to do after testing)
- [ ] Store icon uploaded (icons/icon128.png)
- [ ] Language selected: English
- [ ] Category selected: Productivity
