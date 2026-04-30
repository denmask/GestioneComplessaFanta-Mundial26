let DATA = null;
let currentNazione = null;
let activeFantaBtn = null;
let activeSidebarLink = null;

async function loadData() {
  const res = await fetch('data.json');
  DATA = await res.json();
  init();
}

function init() {
  buildFantaNav();
  buildSidebar();
  showHome();
}

function buildFantaNav() {
  const nav = document.getElementById('fanta-nav');
  nav.innerHTML = '';
  DATA.fantallenatori.forEach(f => {
    const btn = document.createElement('button');
    btn.className = 'fanta-btn';
    btn.textContent = f.nome;
    btn.onclick = () => openFantaModal(f, btn);
    nav.appendChild(btn);
  });
  const extraDiv = document.createElement('div');
  extraDiv.className = 'nav-extra';
  const btnCal = document.createElement('button');
  btnCal.className = 'nav-extra-btn';
  btnCal.textContent = '📅 Calendario';
  btnCal.onclick = () => showCalendario(null);
  const btnElim = document.createElement('button');
  btnElim.className = 'nav-extra-btn';
  btnElim.textContent = '🏆 Eliminazione';
  btnElim.onclick = () => showEliminazione();
  extraDiv.appendChild(btnCal);
  extraDiv.appendChild(btnElim);
  nav.appendChild(extraDiv);
}

function buildSidebar() {
  const ul = document.getElementById('sidebar-list');
  ul.innerHTML = '';
  DATA.nazionali.forEach(n => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#';
    a.innerHTML = `<span class="flag">${n.bandiera}</span><span class="nation-name">${n.nome}</span>`;
    a.onclick = (e) => {
      e.preventDefault();
      if (activeSidebarLink) activeSidebarLink.classList.remove('active');
      a.classList.add('active');
      activeSidebarLink = a;
      showCalendario(n.nome);
      if (window.innerWidth <= 768) toggleSidebar(false);
    };
    li.appendChild(a);
    ul.appendChild(li);
  });
}

function buildDashboard() {
  const grid = document.getElementById('dashboard-grid');
  grid.innerHTML = '';
  const colors = ['#2196f3','#e63946','#4caf50','#ff9800','#9c27b0','#00bcd4','#795548','#607d8b','#f44336','#3f51b5','#009688','#ff5722'];
  DATA.nazionali.forEach((n, i) => {
    const card = document.createElement('div');
    card.className = 'nation-card';
    card.style.borderTopColor = colors[i % colors.length];
    card.innerHTML = `<div class="flag">${n.bandiera}</div><div class="nome">${n.nome}</div><div class="fanta">👤 ${n.fantallenatore}</div>`;
    card.onclick = () => showCalendario(n.nome);
    grid.appendChild(card);
  });
}

function showHome() {
  document.getElementById('home-view').classList.remove('hidden');
  document.getElementById('calendario-view').classList.add('hidden');
  document.getElementById('eliminazione-view').classList.add('hidden');
  if (activeSidebarLink) activeSidebarLink.classList.remove('active');
  activeSidebarLink = null;
  buildDashboard();
}

function showCalendario(nazioneFiltro) {
  document.getElementById('home-view').classList.add('hidden');
  document.getElementById('eliminazione-view').classList.add('hidden');
  document.getElementById('calendario-view').classList.remove('hidden');

  const title = document.getElementById('cal-title');
  if (nazioneFiltro) {
    const n = DATA.nazionali.find(x => x.nome === nazioneFiltro);
    const flag = n ? n.bandiera : '';
    title.textContent = `${flag} Calendario — ${nazioneFiltro}`;
    currentNazione = nazioneFiltro;
  } else {
    title.textContent = '📅 Calendario Completo';
    currentNazione = null;
  }

  const content = document.getElementById('calendario-content');
  content.innerHTML = '';

  const giornate = [
    { label: '1ª Giornata', key: 'prima_giornata', color: '#2196f3' },
    { label: '2ª Giornata', key: 'seconda_giornata', color: '#4caf50' },
    { label: '3ª Giornata', key: 'terza_giornata', color: '#ff9800' }
  ];

  giornate.forEach(g => {
    let partite = DATA.calendario_fanta[g.key];
    if (nazioneFiltro) {
      partite = partite.filter(p => p.casa === nazioneFiltro || p.trasferta === nazioneFiltro);
    }
    if (partite.length === 0) return;

    const block = document.createElement('div');
    block.className = 'giornata-block';

    const label = document.createElement('div');
    label.className = 'giornata-label';
    label.textContent = g.label;
    label.style.background = g.color;
    block.appendChild(label);

    const grid = document.createElement('div');
    grid.className = 'partite-grid';

    partite.forEach(p => {
      const casaN = DATA.nazionali.find(x => x.nome === p.casa);
      const trasfN = DATA.nazionali.find(x => x.nome === p.trasferta);
      const flagC = casaN ? casaN.bandiera : '';
      const flagT = trasfN ? trasfN.bandiera : '';

      const score = (p.gol_casa !== null && p.gol_trasferta !== null)
        ? `${p.gol_casa} - ${p.gol_trasferta}`
        : '? - ?';

      const card = document.createElement('div');
      card.className = 'match-card';
      card.innerHTML = `
        <div class="match-teams">
          <span>${flagC} ${p.casa}</span>
          <span class="vs">VS</span>
          <span>${p.trasferta} ${flagT}</span>
        </div>
        <div class="match-score">${score}</div>
        <div class="match-fanta">
          <span>👤 ${p.fanta_casa}</span>
          <span>👤 ${p.fanta_trasferta}</span>
        </div>
      `;
      grid.appendChild(card);
    });

    block.appendChild(grid);
    content.appendChild(block);
  });

  if (content.innerHTML === '') {
    content.innerHTML = '<p style="color:#888;font-weight:700;">Nessuna partita trovata per questa nazione.</p>';
  }
}

function showEliminazione() {
  document.getElementById('home-view').classList.add('hidden');
  document.getElementById('calendario-view').classList.add('hidden');
  document.getElementById('eliminazione-view').classList.remove('hidden');

  const content = document.getElementById('eliminazione-content');
  content.innerHTML = '';

  const fasi = [
    { label: '⚔️ Sedicesimi di Finale', key: 'sedicesimi', color: '#607d8b' },
    { label: '🥊 Ottavi di Finale', key: 'ottavi', color: '#9c27b0' },
    { label: '⚡ Quarti di Finale', key: 'quarti', color: '#ff9800' },
    { label: '🔥 Semifinali', key: 'semifinali', color: '#e63946' },
    { label: '🥉 Terzo Posto', key: 'terzo_posto', color: '#795548' },
    { label: '🏆 FINALE', key: 'finale', color: '#0d0d0d' }
  ];

  fasi.forEach(fase => {
    const partite = DATA.fase_eliminazione[fase.key];
    if (!partite || partite.length === 0) return;

    const section = document.createElement('div');
    section.className = 'elim-section';

    const label = document.createElement('div');
    label.className = 'elim-label';
    label.textContent = fase.label;
    label.style.background = fase.color;
    section.appendChild(label);

    const grid = document.createElement('div');
    grid.className = 'elim-grid';

    partite.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = 'elim-card' + (!p.casa ? ' tbd' : '');

      let casaHtml = '';
      let trasfHtml = '';
      let scoreHtml = '';

      if (p.casa) {
        const cn = DATA.nazionali.find(x => x.nome === p.casa);
        const tn = DATA.nazionali.find(x => x.nome === p.trasferta);
        const fc = cn ? cn.bandiera : '';
        const ft = tn ? tn.bandiera : '';

        const casaClass = p.vincitore === p.casa ? 'team-qualified' : (p.vincitore && p.vincitore !== p.casa ? 'team-eliminated' : '');
        const trasfClass = p.vincitore === p.trasferta ? 'team-qualified' : (p.vincitore && p.vincitore !== p.trasferta ? 'team-eliminated' : '');

        casaHtml = `<span class="${casaClass}">${fc} ${p.casa}</span>`;
        trasfHtml = `<span class="${trasfClass}">${p.trasferta} ${ft}</span>`;
        scoreHtml = (p.gol_casa !== null && p.gol_trasferta !== null)
          ? `${p.gol_casa} - ${p.gol_trasferta}`
          : '? - ?';
      } else {
        casaHtml = `<span class="team-tbd">TBD</span>`;
        trasfHtml = `<span class="team-tbd">TBD</span>`;
        scoreHtml = '- - -';
      }

      card.innerHTML = `
        <div class="elim-match">
          ${casaHtml}
          <span class="vs">VS</span>
          ${trasfHtml}
        </div>
        <div class="elim-score">${scoreHtml}</div>
      `;

      grid.appendChild(card);
    });

    section.appendChild(grid);
    content.appendChild(section);
  });
}

function openFantaModal(f, btn) {
  if (activeFantaBtn) activeFantaBtn.classList.remove('active');
  btn.classList.add('active');
  activeFantaBtn = btn;

  const nazioniHtml = f.nazionali && f.nazionali.length
    ? f.nazionali.map(n => {
        const nd = DATA.nazionali.find(x => x.nome === n);
        return `<span class="modal-tag nazione">${nd ? nd.bandiera : ''} ${n}</span>`;
      }).join('')
    : '<span style="color:#aaa;font-size:0.8rem">—</span>';

  const stagHtml = f.stagioni.map(s => `<span class="modal-tag">${s}</span>`).join('');
  const tornHtml = f.tornei.length
    ? f.tornei.map(t => `<span class="modal-tag torneo">🏆 ${t}</span>`).join('')
    : '<span style="color:#aaa;font-size:0.8rem">—</span>';

  const totalLabel = f.anni === 1 ? '1 stagione' : `${f.anni} stagioni`;

  document.getElementById('modal-content').innerHTML = `
    <div class="modal-nome">${f.nome}</div>
    <div class="modal-anni">⚽ ${totalLabel} nel Fanta</div>
    <div class="modal-section-title">Stagioni</div>
    <div class="modal-tags">${stagHtml}</div>
    <div class="modal-section-title">Tornei Speciali</div>
    <div class="modal-tags">${tornHtml}</div>
    <div class="modal-section-title">Nazionali Affidate</div>
    <div class="modal-tags">${nazioniHtml}</div>
  `;

  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  if (activeFantaBtn) {
    activeFantaBtn.classList.remove('active');
    activeFantaBtn = null;
  }
}

function toggleSidebar(force) {
  const sidebar = document.getElementById('sidebar');
  if (force === false) {
    sidebar.classList.remove('open');
  } else {
    sidebar.classList.toggle('open');
  }
}

document.getElementById('modal-overlay').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

loadData();