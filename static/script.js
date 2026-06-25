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

