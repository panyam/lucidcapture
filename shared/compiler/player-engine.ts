import { ICONS } from './icons'

/** The standalone vanilla JS player engine — exported as a string to embed in compiled HTML */
export const PLAYER_JS = `
(function() {
  'use strict';

  var data = window.__LUCID_DATA__;
  if (!data || !data.steps || !data.steps.length) return;

  var steps = data.steps;
  var state = {
    index: 0,
    playing: false,
    finished: false,
    showControls: true,
    aspectRatio: null
  };

  var timer = null;
  var controlsTimer = null;

  // ── DOM refs ──
  var $ = function(id) { return document.getElementById(id); };
  var root = $('lc-root');
  var topbar = $('lc-topbar');
  var title = $('lc-title');
  var counter = $('lc-step-counter');
  var progress = $('lc-progress');
  var canvas = $('lc-canvas');
  var screenshot = $('lc-screenshot');
  var hotspot = $('lc-hotspot');
  var tooltipEl = $('lc-tooltip');
  var badge = $('lc-step-badge');
  var finishedEl = $('lc-finished');
  var bottom = $('lc-bottom');
  var timeline = $('lc-timeline');
  var prevBtn = $('lc-prev');
  var playBtn = $('lc-play');
  var nextBtn = $('lc-next');

  // ── Icons ──
  var icons = ${JSON.stringify(ICONS)};

  // ── Utility: HTML-escape user content ──
  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }

  // ── Init ──
  title.textContent = data.title;
  buildTimeline();
  readHash();
  render();

  // Auto-start
  setTimeout(function() { play(); }, 500);

  // ── Rendering ──
  function render() {
    var step = steps[state.index];
    if (!step) return;

    // Screenshot
    screenshot.src = step.screenshotUri;
    screenshot.onload = function() {
      if (this.naturalWidth && this.naturalHeight && !state.aspectRatio) {
        state.aspectRatio = this.naturalWidth / this.naturalHeight;
        canvas.style.aspectRatio = state.aspectRatio;
      }
    };
    if (state.aspectRatio) canvas.style.aspectRatio = state.aspectRatio;

    // Step badge
    badge.textContent = state.index + 1;

    // Counter
    counter.textContent = 'Step ' + (state.index + 1) + ' of ' + steps.length;

    // Progress
    progress.style.width = ((state.index + 1) / steps.length * 100) + '%';

    // Hotspot
    if (step.clickTarget && !state.finished) {
      hotspot.style.display = '';
      hotspot.style.left = (step.clickTarget.x * 100) + '%';
      hotspot.style.top = (step.clickTarget.y * 100) + '%';
      // Build tooltip content safely using textContent
      tooltipEl.textContent = '';
      if (step.annotation && step.annotation.title) {
        var titleDiv = document.createElement('div');
        titleDiv.textContent = step.annotation.title;
        tooltipEl.appendChild(titleDiv);
        if (step.annotation.body) {
          var bodyDiv = document.createElement('div');
          bodyDiv.className = 'lc-tooltip-body';
          bodyDiv.textContent = step.annotation.body;
          tooltipEl.appendChild(bodyDiv);
        }
      } else if (step.clickTarget.label) {
        var labelDiv = document.createElement('div');
        labelDiv.textContent = step.clickTarget.label;
        tooltipEl.appendChild(labelDiv);
      }
    } else {
      hotspot.style.display = 'none';
    }

    // Finished overlay
    finishedEl.style.display = state.finished ? '' : 'none';

    // Controls
    prevBtn.disabled = state.index === 0;
    nextBtn.disabled = state.index >= steps.length - 1;
    playBtn.textContent = '';
    playBtn.insertAdjacentHTML('afterbegin', state.finished ? icons.replay : state.playing ? icons.pause : icons.play_arrow);

    // Timeline active
    var thumbs = timeline.children;
    for (var i = 0; i < thumbs.length; i++) {
      thumbs[i].classList.toggle('lc-active', i === state.index);
    }
    // Scroll active thumb into view
    if (thumbs[state.index]) {
      thumbs[state.index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    updateHash();
  }

  // ── Navigation ──
  function goToStep(i) {
    if (i < 0 || i >= steps.length) return;
    clearTimer();
    state.index = i;
    state.finished = false;
    render();
    if (state.playing) scheduleAdvance();
  }

  function advance() {
    if (state.index >= steps.length - 1) {
      state.finished = true;
      state.playing = false;
      render();
      return;
    }
    state.index++;
    render();
    if (state.playing) scheduleAdvance();
  }

  // ── Playback ──
  function play() {
    if (state.finished) { restart(); return; }
    state.playing = true;
    render();
    scheduleAdvance();
  }

  function pause() {
    state.playing = false;
    clearTimer();
    render();
  }

  function togglePlay() {
    state.playing ? pause() : play();
  }

  function restart() {
    state.index = 0;
    state.finished = false;
    state.playing = true;
    render();
    scheduleAdvance();
  }

  function scheduleAdvance() {
    clearTimer();
    var dur = steps[state.index] ? steps[state.index].duration : 3000;
    timer = setTimeout(advance, dur);
  }

  function clearTimer() {
    if (timer) { clearTimeout(timer); timer = null; }
  }

  // ── Controls visibility ──
  function showControlsTemp() {
    state.showControls = true;
    topbar.classList.remove('lc-hidden');
    bottom.classList.remove('lc-hidden');
    root.style.cursor = 'default';

    if (controlsTimer) clearTimeout(controlsTimer);
    controlsTimer = setTimeout(function() {
      if (state.playing) {
        state.showControls = false;
        topbar.classList.add('lc-hidden');
        bottom.classList.add('lc-hidden');
        root.style.cursor = 'none';
      }
    }, 3000);
  }

  // ── URL hash ──
  function updateHash() {
    history.replaceState(null, '', '#step-' + (state.index + 1));
  }

  function readHash() {
    var m = location.hash.match(/step-(\\d+)/);
    if (m) {
      var i = parseInt(m[1], 10) - 1;
      if (i >= 0 && i < steps.length) state.index = i;
    }
  }

  // ── Timeline ──
  function buildTimeline() {
    for (var i = 0; i < steps.length; i++) {
      var thumb = document.createElement('button');
      thumb.className = 'lc-thumb' + (i === 0 ? ' lc-active' : '');
      thumb.setAttribute('data-index', i);

      var img = document.createElement('img');
      img.src = steps[i].screenshotUri;
      img.alt = '';
      img.draggable = false;
      thumb.appendChild(img);

      var num = document.createElement('div');
      num.className = 'lc-thumb-num';
      num.textContent = i + 1;
      thumb.appendChild(num);

      var dur = document.createElement('div');
      dur.className = 'lc-thumb-dur';
      dur.textContent = (steps[i].duration / 1000).toFixed(1) + 's';
      thumb.appendChild(dur);

      thumb.addEventListener('click', (function(idx) {
        return function() { goToStep(idx); state.finished = false; };
      })(i));

      timeline.appendChild(thumb);
    }
  }

  // ── Events ──
  hotspot.addEventListener('click', function(e) {
    e.stopPropagation();
    if (state.index < steps.length - 1) {
      goToStep(state.index + 1);
      if (!state.playing) play();
    } else {
      state.finished = true;
      state.playing = false;
      render();
    }
  });

  prevBtn.addEventListener('click', function() { goToStep(state.index - 1); });
  nextBtn.addEventListener('click', function() { goToStep(state.index + 1); });
  playBtn.addEventListener('click', function() { togglePlay(); });
  $('lc-replay').addEventListener('click', function() { restart(); });

  root.addEventListener('mousemove', showControlsTemp);

  document.addEventListener('keydown', function(e) {
    if (e.key === ' ' || e.code === 'Space') { e.preventDefault(); togglePlay(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); goToStep(state.index + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); goToStep(state.index - 1); }
    else if (e.key === 'Escape') { pause(); }
  });

  window.addEventListener('hashchange', function() {
    readHash();
    render();
  });
})();
`
