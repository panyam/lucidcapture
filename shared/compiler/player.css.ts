export const PLAYER_CSS = `
/* Lucid Capture Player — self-contained styles */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root {
  --lc-primary: #0029c0;
  --lc-primary-container: #2142e7;
  --lc-bg: #293040;
  --lc-text: rgba(255,255,255,0.9);
  --lc-text-dim: rgba(255,255,255,0.4);
  --lc-text-muted: rgba(255,255,255,0.6);
  --lc-surface: rgba(255,255,255,0.1);
  --lc-surface-hover: rgba(255,255,255,0.2);
}

body { margin:0; background: var(--lc-bg); font-family: system-ui,-apple-system,"Segoe UI",sans-serif; color: var(--lc-text); overflow: hidden; }

.lc-root { min-height:100vh; display:flex; flex-direction:column; }

/* Top bar */
.lc-topbar { position:fixed; top:0; left:0; right:0; z-index:50; transition: opacity 0.5s; }
.lc-topbar.lc-hidden { opacity:0; pointer-events:none; }
.lc-topbar-inner { display:flex; justify-content:space-between; align-items:center; padding:16px 24px; }
.lc-title { font-size:18px; font-weight:900; letter-spacing:-0.5px; }
.lc-step-counter { font-size:12px; font-weight:600; color: var(--lc-text-dim); margin-left:12px; }
.lc-progress-track { height:2px; background: var(--lc-surface); }
.lc-progress { height:100%; background: var(--lc-primary); transition: width 0.3s ease-out; }

/* Stage */
.lc-stage { flex:1; display:flex; align-items:center; justify-content:center; padding:32px; }
.lc-canvas { position:relative; width:100%; max-width:72rem; border-radius:16px; overflow:hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
.lc-screenshot { width:100%; height:100%; display:block; object-fit:fill; user-select:none; -webkit-user-drag:none; }

/* Hotspot */
.lc-hotspot {
  position:absolute; border:none; background:none; cursor:pointer; padding:0;
  transform: translate(-50%,-50%);
  transition: left 2.5s cubic-bezier(0.25,0.1,0.25,1), top 2.5s cubic-bezier(0.25,0.1,0.25,1);
}
.lc-hotspot-ring {
  width:40px; height:40px; border-radius:50%;
  background: rgba(0,41,192,0.2);
  display:flex; align-items:center; justify-content:center;
  animation: lc-ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
}
.lc-hotspot-dot { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:20px; height:20px; border-radius:50%; background: rgba(0,41,192,0.8); box-shadow: 0 4px 12px rgba(0,41,192,0.4); }
.lc-hotspot:hover .lc-hotspot-dot { transform: translate(-50%,-50%) scale(1.15); }

@keyframes lc-ping {
  0% { transform:scale(1); opacity:1; }
  75%,100% { transform:scale(1.8); opacity:0; }
}

/* Tooltip */
.lc-tooltip {
  position:absolute; bottom:calc(100% + 12px); left:50%; transform:translateX(-50%);
  background:white; color:#141b2b; border-radius:8px; padding:8px 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  white-space:nowrap; opacity:0; transition: opacity 0.2s;
  pointer-events:none; font-size:12px; font-weight:600;
}
.lc-tooltip-body { font-size:10px; font-weight:400; color:#666; margin-top:2px; }
.lc-tooltip::after {
  content:''; position:absolute; top:100%; left:50%; transform:translateX(-50%);
  border:6px solid transparent; border-top-color:white;
}
.lc-hotspot:hover .lc-tooltip { opacity:1; }

/* Step number badge */
.lc-step-badge {
  position:absolute; top:16px; left:16px; width:28px; height:28px; border-radius:50%;
  background: var(--lc-primary); color:white; font-size:12px; font-weight:800;
  display:flex; align-items:center; justify-content:center; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

/* Finished overlay */
.lc-finished {
  position:absolute; inset:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px);
  display:flex; align-items:center; justify-content:center; flex-direction:column;
}
.lc-finished-text { font-size:18px; font-weight:600; margin:16px 0 24px; }
.lc-finished-actions { display:flex; gap:12px; }
.lc-btn-replay {
  background:white; color:#141b2b; border:none; padding:10px 24px; border-radius:9999px;
  font-size:14px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:8px;
}
.lc-btn-replay:hover { background:rgba(255,255,255,0.9); }
.lc-btn-replay svg { width:16px; height:16px; }

/* Bottom controls */
.lc-bottom { position:fixed; bottom:0; left:0; right:0; z-index:50; transition: opacity 0.5s; padding-bottom:24px; }
.lc-bottom.lc-hidden { opacity:0; pointer-events:none; }

/* Timeline */
.lc-timeline { display:flex; gap:6px; overflow-x:auto; padding:0 32px 8px; }
.lc-timeline::-webkit-scrollbar { height:4px; }
.lc-timeline::-webkit-scrollbar-thumb { background: var(--lc-surface); border-radius:2px; }
.lc-thumb {
  flex-shrink:0; width:112px; height:80px; border-radius:8px; overflow:hidden;
  border:2px solid transparent; cursor:pointer; position:relative; transition: all 0.2s;
  background: var(--lc-surface);
}
.lc-thumb:hover { border-color: var(--lc-text-muted); }
.lc-thumb.lc-active { border-color: var(--lc-primary); transform: scale(1.05); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
.lc-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
.lc-thumb-num {
  position:absolute; top:4px; left:4px; width:16px; height:16px; border-radius:50%;
  background:rgba(0,0,0,0.5); color:white; font-size:9px; font-weight:800;
  display:flex; align-items:center; justify-content:center;
}
.lc-thumb.lc-active .lc-thumb-num { background: var(--lc-primary); }
.lc-thumb-dur {
  position:absolute; bottom:4px; right:4px; font-size:8px; font-weight:600;
  background:rgba(0,0,0,0.5); color:white; padding:1px 4px; border-radius:4px;
}

/* Controls */
.lc-controls { display:flex; align-items:center; justify-content:center; gap:16px; }
.lc-ctrl-btn {
  background:none; border:none; color: var(--lc-text-muted); cursor:pointer;
  padding:8px; border-radius:50%; transition: color 0.15s, background 0.15s;
}
.lc-ctrl-btn:hover { color:white; background: var(--lc-surface); }
.lc-ctrl-btn:disabled { opacity:0.3; cursor:default; }
.lc-ctrl-btn svg { width:24px; height:24px; display:block; }
.lc-ctrl-play {
  width:48px; height:48px; border-radius:50%;
  background: var(--lc-surface-hover); backdrop-filter:blur(8px);
  border:none; color:white; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  transition: background 0.15s;
}
.lc-ctrl-play:hover { background: var(--lc-surface); }
.lc-ctrl-play svg { width:28px; height:28px; }
`
