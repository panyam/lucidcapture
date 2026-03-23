import { PLAYER_JS } from './player-engine'
import { PLAYER_CSS } from './player.css'
import type { CompiledProject } from './types'

function escapeHTML(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** Compile a project into a single self-contained HTML file */
export function compileToHTML(project: CompiledProject): string {
  const dataJson = JSON.stringify(project).replace(/<\/script>/gi, '<\\/script>')
  const titleEscaped = escapeHTML(project.title)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="Lucid Capture (${project.compiledAt})">
  <title>${titleEscaped} — Lucid Capture</title>
  <style>${PLAYER_CSS}</style>
</head>
<body>
  <div id="lc-root" class="lc-root">
    <!-- Top bar -->
    <div id="lc-topbar" class="lc-topbar">
      <div class="lc-topbar-inner">
        <div style="display:flex;align-items:center;gap:12px">
          <span id="lc-title" class="lc-title"></span>
          <span id="lc-step-counter" class="lc-step-counter"></span>
        </div>
      </div>
      <div class="lc-progress-track">
        <div id="lc-progress" class="lc-progress"></div>
      </div>
    </div>

    <!-- Stage -->
    <div class="lc-stage">
      <div id="lc-canvas" class="lc-canvas">
        <img id="lc-screenshot" class="lc-screenshot" alt="" draggable="false">
        <button id="lc-hotspot" class="lc-hotspot" style="display:none">
          <div class="lc-hotspot-ring"></div>
          <div class="lc-hotspot-dot"></div>
          <div id="lc-tooltip" class="lc-tooltip"></div>
        </button>
        <div id="lc-step-badge" class="lc-step-badge">1</div>
        <div id="lc-finished" class="lc-finished" style="display:none">
          <span class="lc-finished-text">Demo complete</span>
          <div class="lc-finished-actions">
            <button id="lc-replay" class="lc-btn-replay">Replay</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom controls -->
    <div id="lc-bottom" class="lc-bottom">
      <div id="lc-timeline" class="lc-timeline"></div>
      <div class="lc-controls">
        <button id="lc-prev" class="lc-ctrl-btn"></button>
        <button id="lc-play" class="lc-ctrl-play"></button>
        <button id="lc-next" class="lc-ctrl-btn"></button>
      </div>
    </div>
  </div>

  <script>window.__LUCID_DATA__=${dataJson};</script>
  <script>${PLAYER_JS}</script>
</body>
</html>`
}
