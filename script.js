let DATA = null;
let currentNazione = null;
let activeFantaBtn = null;
let activeSidebarLink = null;
let sidebarOpen = false;

function flagImg(iso, size) {
  if (!iso) return '';
  const s = size || 24;
  const h = Math.round(s * 0.75);
  return `<img src="https://flagcdn.com/${s}x${h}/${iso}.png" alt="${iso}" style="width:${s}px;height:${h}px;object-fit:cover;border-radius:4px;vertical-align:middle;display:inline-block;">`;
}

async function loadData() {
  const res = await fetch('data.json');
  DATA = await res.json();
  init();
}

function init() {
  buildSidebar();
  buildFantallenatoriSidebar();
  showHome();
}

function buildSidebar() {
  const ul = document.getElementById('sidebar-list');
  ul.innerHTML = '';
  DATA.nazionali.forEach(n => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#';
    a.innerHTML = '<span class="flag">' + flagImg(n.iso, 28) + '</span><span class="nation-name">' + n.nome + '</span>';
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

function buildFantallenatoriSidebar() {
  const ul = document.getElementById('fantallenatori-list');
  ul.innerHTML = '';
  
  // Ordina alfabeticamente
  const sorted = [...DATA.fantallenatori].sort((a,b) => a.nome.localeCompare(b.nome));
  
  sorted.forEach(f => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.innerHTML = '👤 ' + f.nome;
    a.onclick = (e) => {
      e.preventDefault();
      // Rimuovi active da tutti i link
      document.querySelectorAll('#fantallenatori-list li a').forEach(link => {
        link.classList.remove('active');
      });
      a.classList.add('active');
      openFantaModal(f, a);
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
    card.innerHTML = '<div class="flag-big">' + flagImg(n.iso, 56) + '</div><div class="nome">' + n.nome + '</div><div class="fanta">👤 ' + n.fantallenatore + '</div>';
    card.onclick = () => showCalendario(n.nome);
    grid.appendChild(card);
  });
}

function showHome() {
  document.getElementById('home-view').classList.remove('hidden');
  document.getElementById('calendario-view').classList.add('hidden');
  document.getElementById('calendario-reale-view').classList.add('hidden');
  document.getElementById('classifica-fanta-view').classList.add('hidden');
  document.getElementById('classifica-reale-view').classList.add('hidden');
  document.getElementById('eliminazione-view').classList.add('hidden');
  if (activeSidebarLink) activeSidebarLink.classList.remove('active');
  activeSidebarLink = null;
  if (window.innerWidth <= 768) toggleSidebar(false);
  buildDashboard();
}

function showCalendario(nazioneFiltro) {
  document.getElementById('home-view').classList.add('hidden');
  document.getElementById('calendario-reale-view').classList.add('hidden');
  document.getElementById('classifica-fanta-view').classList.add('hidden');
  document.getElementById('classifica-reale-view').classList.add('hidden');
  document.getElementById('eliminazione-view').classList.add('hidden');
  document.getElementById('calendario-view').classList.remove('hidden');

  const title = document.getElementById('cal-title');
  if (nazioneFiltro) {
    const n = DATA.nazionali.find(x => x.nome === nazioneFiltro);
    const fimg = n ? flagImg(n.iso, 28) : '';
    title.innerHTML = fimg + ' Calendario — ' + nazioneFiltro;
    currentNazione = nazioneFiltro;
  } else {
    title.innerHTML = '📋 Calendario FantaMundial';
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

    partite.forEach(p => {
      const casaN = DATA.nazionali.find(x => x.nome === p.casa);
      const trasfN = DATA.nazionali.find(x => x.nome === p.trasferta);
      const flagC = casaN ? flagImg(casaN.iso, 24) : '';
      const flagT = trasfN ? flagImg(trasfN.iso, 24) : '';
      const score = (p.gol_casa !== null && p.gol_trasferta !== null) ? p.gol_casa + ' - ' + p.gol_trasferta : '? - ?';

      const card = document.createElement('div');
      card.className = 'match-card';
      card.onclick = () => openFormazioneModal(p);
      card.innerHTML =
        '<div class="match-teams"><span class="team-label">' + flagC + ' ' + p.casa + '</span><span class="vs">VS</span><span class="team-label">' + p.trasferta + ' ' + flagT + '</span></div>' +
        '<div class="match-score">' + score + '</div>' +
        '<div class="match-fanta"><span>👤 ' + p.fanta_casa + '</span><span>👤 ' + p.fanta_trasferta + '</span></div>';
      block.appendChild(card);
    });

    content.appendChild(block);
  });

  if (content.innerHTML === '') {
    content.innerHTML = '<p style="color:#888;font-weight:600;">Nessuna partita trovata per questa nazione.</p>';
  }
}

function openFormazioneModal(partita) {
  const modal = document.getElementById('formazione-modal');
  const content = document.getElementById('formazione-content');

  const formCasa = partita.formazione_casa;
  const formTrasf = partita.formazione_trasferta;

  const casaGiocatori = formCasa.titolari.map(g => `<span class="giocatore">${g}</span>`).join('');
  const trasfGiocatori = formTrasf.titolari.map(g => `<span class="giocatore">${g}</span>`).join('');

  content.innerHTML = `
    <div class="formazione-header">📋 Probabili Formazioni</div>
    <div class="formazione-squadra">
      <h4>${partita.casa} 🏠</h4>
      <div class="formazione-modulo">Modulo: ${formCasa.modulo}</div>
      <div class="formazione-giocatori">${casaGiocatori}</div>
    </div>
    <div class="formazione-squadra">
      <h4>${partita.trasferta} ✈️</h4>
      <div class="formazione-modulo">Modulo: ${formTrasf.modulo}</div>
      <div class="formazione-giocatori">${trasfGiocatori}</div>
    </div>
  `;

  modal.classList.remove('hidden');
}

function closeFormazioneModal() {
  document.getElementById('formazione-modal').classList.add('hidden');
}

function showCalendarioReale() {
  document.getElementById('home-view').classList.add('hidden');
  document.getElementById('calendario-view').classList.add('hidden');
  document.getElementById('classifica-fanta-view').classList.add('hidden');
  document.getElementById('classifica-reale-view').classList.add('hidden');
  document.getElementById('eliminazione-view').classList.add('hidden');
  document.getElementById('calendario-reale-view').classList.remove('hidden');

  const content = document.getElementById('calendario-reale-content');
  content.innerHTML = '';

  const giornate = ['giornata_1', 'giornata_2', 'giornata_3'];
  const nomiGiornate = ['1ª Giornata', '2ª Giornata', '3ª Giornata'];

  giornate.forEach((g, idx) => {
    const partite = DATA.calendario_reale[g];
    if (!partite || partite.length === 0) return;

    const section = document.createElement('div');
    section.className = 'reale-giornata';

    const title = document.createElement('div');
    title.className = 'reale-giornata-title';
    title.textContent = nomiGiornate[idx];
    section.appendChild(title);

    partite.forEach(p => {
      const flagCasa = p.iso_casa ? flagImg(p.iso_casa, 20) : '';
      const flagTrasf = p.iso_trasferta ? flagImg(p.iso_trasferta, 20) : '';
      const score = (p.gol_casa !== null && p.gol_trasferta !== null) ? `${p.gol_casa} - ${p.gol_trasferta}` : '? - ?';

      const card = document.createElement('div');
      card.className = 'reale-match-card';
      card.innerHTML = `
        <div class="reale-match-info">
          <div class="reale-match-data">${p.data}</div>
          <div class="reale-match-teams">${flagCasa} ${p.casa} vs ${p.trasferta} ${flagTrasf}</div>
          <div class="reale-match-sede">📍 ${p.sede}</div>
          <div class="reale-match-sede">Gruppo ${p.gruppo}</div>
        </div>
        <div class="reale-match-score">${score}</div>
      `;
      section.appendChild(card);
    });

    content.appendChild(section);
  });
}

function showClassificaFanta() {
  document.getElementById('home-view').classList.add('hidden');
  document.getElementById('calendario-view').classList.add('hidden');
  document.getElementById('calendario-reale-view').classList.add('hidden');
  document.getElementById('classifica-reale-view').classList.add('hidden');
  document.getElementById('eliminazione-view').classList.add('hidden');
  document.getElementById('classifica-fanta-view').classList.remove('hidden');

  const content = document.getElementById('classifica-fanta-content');
  const classifica = DATA.classifica_fanta;

  let html = '<div class="classifica-table"><table><thead><tr><th>Pos</th><th>Fantallenatore</th><th>Pti</th><th>V</th><th>N</th><th>P</th><th>GF</th><th>GS</th></tr></thead><tbody>';
  classifica.forEach(c => {
    const isTop = c.posizione === 1;
    html += `<tr class="${isTop ? 'posizione-1' : ''}">
      <td><strong>${c.posizione}</strong></td>
      <td style="text-align:left; font-weight:600;">${c.fantallenatore}</td>
      <td><strong>${c.punti}</strong></td>
      <td>${c.vittorie}</td><td>${c.pareggi}</td><td>${c.sconfitte}</td>
      <td>${c.gf}</td><td>${c.gs}</td>
    </tr>`;
  });
  html += '</tbody></table></div>';
  content.innerHTML = html;
}

function showClassificaReale() {
  document.getElementById('home-view').classList.add('hidden');
  document.getElementById('calendario-view').classList.add('hidden');
  document.getElementById('calendario-reale-view').classList.add('hidden');
  document.getElementById('classifica-fanta-view').classList.add('hidden');
  document.getElementById('eliminazione-view').classList.add('hidden');
  document.getElementById('classifica-reale-view').classList.remove('hidden');

  const content = document.getElementById('classifica-reale-content');
  const classifica = DATA.classifica_reale;

  let html = '<div class="classifica-table">\n<table>\n<thead>\n<tr><th>Pos</th><th>Squadra</th><th>Gr</th><th>Pti</th><th>G</th><th>V</th><th>N</th><th>P</th><th>GF</th><th>GS</th><th>DR</th></tr>\n</thead>\n<tbody>';
  classifica.sort((a,b) => b.punti - a.punti).forEach((c, idx) => {
    const flag = c.iso ? flagImg(c.iso, 20) : '';
    html += `<tr>
      <td><strong>${idx+1}</strong></td>
      <td style="text-align:left;">${flag} ${c.squadra}</td>
      <td>${c.gruppo}</td>
      <td><strong>${c.punti}</strong></td>
      <td>${c.g}</td><td>${c.v}</td><td>${c.n}</td><td>${c.p}</td>
      <td>${c.gf}</td><td>${c.gs}</td><td>${c.dr}</td>
    </tr>`;
  });
  html += '</tbody>\n</table>\n</div>';
  content.innerHTML = html;
}

function showEliminazione() {
  document.getElementById('home-view').classList.add('hidden');
  document.getElementById('calendario-view').classList.add('hidden');
  document.getElementById('calendario-reale-view').classList.add('hidden');
  document.getElementById('classifica-fanta-view').classList.add('hidden');
  document.getElementById('classifica-reale-view').classList.add('hidden');
  document.getElementById('eliminazione-view').classList.remove('hidden');

  const content = document.getElementById('eliminazione-content');
  content.innerHTML = '';

  const fasi = [
    { label: '⚔️ Sedicesimi', key: 'sedicesimi', color: '#607d8b' },
    { label: '🥊 Ottavi', key: 'ottavi', color: '#9c27b0' },
    { label: '⚡ Quarti', key: 'quarti', color: '#ff9800' },
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

    const grid3 = document.createElement('div');
    grid3.className = 'elim-grid';

    partite.forEach(p => {
      const card = document.createElement('div');
      card.className = 'elim-card' + (!p.casa ? ' tbd' : '');

      let casaHtml, trasfHtml, scoreHtml;

      if (p.casa) {
        const cn = DATA.nazionali.find(x => x.nome === p.casa);
        const tn = DATA.nazionali.find(x => x.nome === p.trasferta);
        const fc = cn ? flagImg(cn.iso, 20) : '';
        const ft = tn ? flagImg(tn.iso, 20) : '';
        const casaClass = p.vincitore === p.casa ? 'team-qualified' : (p.vincitore && p.vincitore !== p.casa ? 'team-eliminated' : '');
        const trasfClass = p.vincitore === p.trasferta ? 'team-qualified' : (p.vincitore && p.vincitore !== p.trasferta ? 'team-eliminated' : '');
        casaHtml = '<span class="' + casaClass + '">' + fc + ' ' + p.casa + '</span>';
        trasfHtml = '<span class="' + trasfClass + '">' + p.trasferta + ' ' + ft + '</span>';
        scoreHtml = (p.gol_casa !== null && p.gol_trasferta !== null) ? p.gol_casa + ' - ' + p.gol_trasferta : '? - ?';
      } else {
        casaHtml = '<span class="team-tbd">TBD</span>';
        trasfHtml = '<span class="team-tbd">TBD</span>';
        scoreHtml = '- - -';
      }

      card.innerHTML =
        '<div class="elim-match">' + casaHtml + '<span class="vs">VS</span>' + trasfHtml + '</div>' +
        '<div class="elim-score">' + scoreHtml + '</div>';

      grid3.appendChild(card);
    });

    section.appendChild(grid3);
    content.appendChild(section);
  });
}

function openFantaModal(f, element) {
  // Rimuovi active da tutti i bottoni fantallenatori nella sidebar
  document.querySelectorAll('#fantallenatori-list li a').forEach(btn => {
    btn.classList.remove('active');
  });
  if (element) element.classList.add('active');

  const nazioniHtml = f.nazionali && f.nazionali.length
    ? f.nazionali.map(n => {
        const nd = DATA.nazionali.find(x => x.nome === n);
        const fi = nd ? flagImg(nd.iso, 20) : '';
        return '<span class="modal-tag nazione">' + fi + ' ' + n + '</span>';
      }).join('')
    : '<span style="color:#aaa;">—</span>';

  const stagHtml = f.stagioni.map(s => '<span class="modal-tag stagione">' + s + '</span>').join('');
  const tornHtml = f.tornei.length
    ? f.tornei.map(t => '<span class="modal-tag torneo">🏆 ' + t + '</span>').join('')
    : '<span style="color:#aaa;">—</span>';

  const totalLabel = f.anni === 1 ? '1 stagione' : f.anni + ' stagioni';
  
  // Calcola statistiche aggiuntive
  const numTornei = f.tornei.length;
  const numNazionali = f.nazionali.length;

  document.getElementById('modal-content').innerHTML = `
    <div class="modal-header">
      <div class="modal-nome">${f.nome}</div>
      <div class="modal-anni">⚽ ${totalLabel}</div>
    </div>
    <div class="modal-body">
      <div class="modal-section">
        <div class="modal-section-title"><span>📅</span> STAGIONI</div>
        <div class="modal-tags">${stagHtml}</div>
      </div>
      
      <div class="modal-section">
        <div class="modal-section-title"><span>🏆</span> TORNEI SPECIALI</div>
        <div class="modal-tags">${tornHtml}</div>
      </div>
      
      <div class="modal-section">
        <div class="modal-section-title"><span>🌍</span> NAZIONALI AFFIDATE</div>
        <div class="modal-tags">${nazioniHtml}</div>
      </div>
      
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">${f.anni}</div>
          <div class="stat-label">STAGIONI</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${numTornei}</div>
          <div class="stat-label">TORNEI</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${numNazionali}</div>
          <div class="stat-label">NAZIONALI</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  // Non rimuoviamo active qui perché potrebbe essere stato chiuso con click fuori
}

function toggleSidebar(force) {
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger');
  if (force === false) {
    sidebarOpen = false;
    sidebar.classList.remove('open');
    hamburger.textContent = '☰';
  } else {
    sidebarOpen = !sidebarOpen;
    if (sidebarOpen) {
      sidebar.classList.add('open');
      hamburger.textContent = '✕';
    } else {
      sidebar.classList.remove('open');
      hamburger.textContent = '☰';
    }
  }
}

// Chiudi modali cliccando fuori
document.getElementById('modal-overlay').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});
document.getElementById('formazione-modal').addEventListener('click', function(e) {
  if (e.target === this) closeFormazioneModal();
});

// Chiudi sidebar su resize se diventa desktop
window.addEventListener('resize', function() {
  if (window.innerWidth > 768 && sidebarOpen) {
    toggleSidebar(false);
  }
});

loadData();