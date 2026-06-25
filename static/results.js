  // result functionality
   const raw = sessionStorage.getItem('cv_result');

  if (!raw) {
    document.getElementById('empty-state').style.display = 'block';
  } else {
    const data = JSON.parse(raw);
    renderResults(data);
  }

  function renderResults(data) {
    const score = data.score ?? 0;
    const gaps  = data.gaps  ?? [];
    const rewrite = data.rewrite ?? {};

    const page = document.getElementById('page');
    page.innerHTML = buildHTML(score, gaps, rewrite);

    // Animuj pierścień po wyrenderowaniu
    requestAnimationFrame(() => animateRing(score));
  }

  // ── Helpers dla koloru ──
  function scoreColor(s) {
    if (s >= 75) return 'var(--green)';
    if (s >= 50) return 'var(--amber)';
    return 'var(--red)';
  }
  function scoreLabel(s) {
    if (s >= 75) return { text: 'Świetne dopasowanie', icon: '🟢' };
    if (s >= 50) return { text: 'Umiarkowane dopasowanie', icon: '🟡' };
    return { text: 'Słabe dopasowanie', icon: '🔴' };
  }
  function scoreBadgeStyle(s) {
    if (s >= 75) return `background:var(--green-dim);border:1px solid var(--green-border);color:var(--green)`;
    if (s >= 50) return `background:var(--amber-dim);border:1px solid var(--amber-border);color:var(--amber)`;
    return `background:var(--red-dim);border:1px solid var(--red-border);color:var(--red)`;
  }
  function gapPriority(i) {
    if (i === 0) return { color: 'var(--red)',   tag: 'kluczowe',  tagStyle: `background:var(--red-dim);color:var(--red)` };
    if (i <= 2)  return { color: 'var(--amber)', tag: 'ważne',     tagStyle: `background:var(--amber-dim);color:var(--amber)` };
    return              { color: 'var(--muted)', tag: 'dodatkowe', tagStyle: `background:var(--surface2);color:var(--muted)` };
  }

  function buildHTML(score, gaps, rewrite) {
    const lbl = scoreLabel(score);
    const circumference = 2 * Math.PI * 38; // r=38

    const rewriteKeys = Object.keys(rewrite);

    return `
      <!-- Score hero -->
      <div class="score-hero">
        <div class="score-ring-wrap">
          <svg class="score-ring" width="96" height="96" viewBox="0 0 96 96">
            <circle class="ring-bg" cx="48" cy="48" r="38"/>
            <circle class="ring-fg" id="ring-fg" cx="48" cy="48" r="38"
              stroke="${scoreColor(score)}"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${circumference}"/>
          </svg>
          <div class="score-label">
            <span class="score-num" style="color:${scoreColor(score)}">${score}</span>
            <span class="score-pct">/ 100</span>
          </div>
        </div>
        <div class="score-info">
          <div class="score-title">Wynik dopasowania</div>
          <div class="score-subtitle">Twoje CV vs. ta oferta pracy</div>
          <div class="score-badge" style="${scoreBadgeStyle(score)}">
            ${lbl.icon} ${lbl.text}
          </div>
        </div>
      </div>

      <!-- Braki -->
      ${gaps.length ? `
      <div class="section">
        <div class="section-header">
          <div class="section-icon" style="background:var(--red-dim)">⚠️</div>
          <div class="section-title">Czego brakuje w Twoim CV</div>
          <span class="section-count" style="background:var(--red-dim);color:var(--red)">${gaps.length}</span>
        </div>
        <div class="gaps-list">
          ${gaps.map((gap, i) => {
            const p = gapPriority(i);
            return `
            <div class="gap-item">
              <div class="gap-dot" style="background:${p.color}"></div>
              <div class="gap-text">${escHtml(gap)}</div>
              <span class="gap-tag" style="${p.tagStyle}">${p.tag}</span>
            </div>`;
          }).join('')}
        </div>
      </div>` : ''}

      <!-- Sugestie edycji -->
      ${rewriteKeys.length ? `
      <div class="section">
        <div class="section-header">
          <div class="section-icon" style="background:var(--accent-dim)">✏️</div>
          <div class="section-title">Sugestie edycji CV</div>
          <span class="section-count" style="background:var(--accent-dim);color:var(--accent)">${rewriteKeys.length}</span>
        </div>
        <div class="rewrite-list">
          ${rewriteKeys.map((key, i) => {
            const val = rewrite[key];
            const before = typeof val === 'object' ? (val.before ?? '') : '';
            const after  = typeof val === 'object' ? (val.after  ?? val) : val;
            return `
            <div class="rewrite-item" id="ri-${i}">
              <div class="rewrite-header" onclick="toggleRewrite(${i})">
                <div class="rewrite-section-name">
                  <span style="font-size:11px;padding:2px 8px;border-radius:999px;background:var(--surface2);color:var(--muted)">${escHtml(key)}</span>
                </div>
                <span class="rewrite-chevron">⌄</span>
              </div>
              <div class="rewrite-body">
                <div class="rewrite-cols">
                  <div class="rewrite-col before">
                    <div class="rewrite-col-label" style="color:var(--muted)">Przed</div>
                    <div class="rewrite-col-text">${escHtml(before) || '<em style="opacity:.4">brak treści w CV</em>'}</div>
                  </div>
                  <div class="rewrite-col after">
                    <div class="rewrite-col-label" style="color:var(--accent)">Po</div>
                    <div class="rewrite-col-text">${escHtml(after)}</div>
                  </div>
                </div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>` : ''}

      <!-- Akcje -->
      <div class="actions">
        <button class="btn-primary" onclick="copyRewrite()">Skopiuj sugestie</button>
        <a href="/" class="btn-outline">Analizuj inną ofertę</a>
      </div>
    `;
  }

  function animateRing(score) {
    const el = document.getElementById('ring-fg');
    if (!el) return;
    const circumference = 2 * Math.PI * 38;
    const offset = circumference * (1 - score / 100);
    el.style.strokeDashoffset = offset;
  }

  function toggleRewrite(i) {
    const item = document.getElementById('ri-' + i);
    item.classList.toggle('open');
  }

  function copyRewrite() {
    const raw = sessionStorage.getItem('cv_result');
    if (!raw) return;
    const { rewrite = {} } = JSON.parse(raw);
    const text = Object.entries(rewrite)
      .map(([k, v]) => {
        const after = typeof v === 'object' ? v.after ?? v : v;
        return `## ${k}\n${after}`;
      })
      .join('\n\n');
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.querySelector('.btn-primary');
      btn.textContent = '✓ Skopiowano!';
      setTimeout(() => btn.textContent = 'Skopiuj sugestie', 2000);
    });
  }

  function escHtml(str) {
    if (typeof str !== 'string') return String(str ?? '');
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/\n/g, '<br>');
  }