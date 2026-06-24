 let chosenFile = null;

  // Drag & drop
  const zone = document.getElementById('upload-zone');
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  function onFileChosen(input) {
    if (input.files[0]) handleFile(input.files[0]);
  }

  function handleFile(file) {
    const allowed = ['application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|docx)$/i)) {
      showError('Dozwolone formaty to PDF i DOCX.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError('Plik jest za duży. Maksymalny rozmiar to 5 MB.');
      return;
    }
    hideError();
    chosenFile = file;
    document.getElementById('file-name').textContent = file.name;
    document.getElementById('file-chosen').classList.add('show');
    document.getElementById('btn-next').disabled = false;
    document.getElementById('num-1').textContent = '✓';
    document.getElementById('tab-1').classList.add('done');
  }

  function removeFile() {
    chosenFile = null;
    document.getElementById('cv-file').value = '';
    document.getElementById('file-chosen').classList.remove('show');
    document.getElementById('btn-next').disabled = true;
    document.getElementById('num-1').textContent = '1';
    document.getElementById('tab-1').classList.remove('done');
  }

  function goToStep(n) {
    if (n === 2 && !chosenFile) { showError('Najpierw wgraj CV.'); return; }
    hideError();
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.step-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('panel-' + n).classList.add('active');
    document.getElementById('tab-' + n).classList.add('active');
  }

  function onUrlInput() {
    const val = document.getElementById('job-url').value.trim();
    document.getElementById('btn-analyze').disabled = !val.startsWith('http');
  }

  const placeholders = {
    nofluffjobs: 'https://nofluffjobs.com/pl/job/',
    theprotocol:  'https://theprotocol.it/oferta/',
    pracuj:       'https://www.pracuj.pl/praca/',
    linkedin:     'https://www.linkedin.com/jobs/view/',
  };
  function setPlaceholder(key) {
    const input = document.getElementById('job-url');
    input.value = placeholders[key];
    input.focus();
    onUrlInput();
  }

  async function startAnalysis() {
    if (!chosenFile) { showError('Brak pliku CV.'); return; }
    const url = document.getElementById('job-url').value.trim();
    if (!url) { showError('Podaj URL oferty.'); return; }

    hideError();
    showLoading();

    try {
      const formData = new FormData();
      formData.append('cv', chosenFile);
      formData.append('job_url', url);

      // Animacja kroków
      animateLoadingSteps();

      const response = await fetch('/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Błąd serwera (${response.status})`);
      }

      const result = await response.json();
      // Przekierowanie do strony wyników z danymi w sessionStorage
      sessionStorage.setItem('cv_result', JSON.stringify(result));
      window.location.href = '/results';

    } catch (err) {
      hideLoading();
      showError(err.message || 'Coś poszło nie tak. Spróbuj ponownie.');
    }
  }

  function animateLoadingSteps() {
    const steps = ['ls-1','ls-2','ls-3','ls-4'];
    const delays = [0, 1200, 2800, 5000];
    steps.forEach((id, i) => {
      setTimeout(() => {
        if (i > 0) document.getElementById(steps[i-1]).classList.add('done');
        document.getElementById(id).classList.add('active');
      }, delays[i]);
    });
  }

  function showLoading() {
    document.getElementById('panel-2').style.display = 'none';
    document.getElementById('loading').classList.add('show');
  }
  function hideLoading() {
    document.getElementById('panel-2').style.display = 'block';
    document.getElementById('loading').classList.remove('show');
  }

  function showError(msg) {
    const box = document.getElementById('error-box');
    document.getElementById('error-msg').textContent = msg;
    box.classList.add('show');
  }
  function hideError() {
    document.getElementById('error-box').classList.remove('show');
  }

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