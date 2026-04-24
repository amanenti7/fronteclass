const API = "http://localhost:3000";

let state = {
  competitors: [],
  teams: [],
  games: [],
  matches: []
};

document.addEventListener('DOMContentLoaded', async () => {
  await loadInitialData();
  setupNavigation();
  renderAll();
});

async function loadInitialData() {
  const [games, teams, competitors, matches] = await Promise.all([
    fetch(`${API}/games`).then(r => r.json()),
    fetch(`${API}/teams`).then(r => r.json()),
    fetch(`${API}/competitors`).then(r => r.json()),
    fetch(`${API}/matches`).then(r => r.json())
  ]);

  state.games = games;
  state.teams = teams;
  state.competitors = competitors;
  state.matches = matches;
}

/* NAV */
function setupNavigation() {
  const navItems = document.querySelectorAll('#sidebar-nav li');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const viewId = item.getAttribute('data-view');
      switchView(viewId);
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

function switchView(viewId) {
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  document.getElementById(`view-${viewId}`).classList.add('active');
}

/* RENDER */
function renderAll() {
  renderDashboard();
  renderJogos();
  renderTimes();
  renderCompetidores();
  renderConfrontos();
}

function renderDashboard() {
  const statsContainer = document.getElementById('dashboard-stats');
  const upcomingContainer = document.getElementById('upcoming-matches');

  const totalTeams = state.teams.length;
  const totalPlayers = state.competitors.length;
  const finishedMatches = state.matches.filter(m => m.status === 'finished').length;
  const scheduledMatches = state.matches.filter(m => m.status === 'scheduled').length;

  statsContainer.innerHTML = `
    <div class="card"><h3>${totalTeams}</h3><p>Times</p></div>
    <div class="card"><h3>${totalPlayers}</h3><p>Jogadores</p></div>
    <div class="card"><h3>${finishedMatches}</h3><p>Finalizados</p></div>
    <div class="card"><h3>${scheduledMatches}</h3><p>Agendados</p></div>
  `;

  const upcoming = state.matches.filter(m => m.status === 'scheduled');

  upcomingContainer.innerHTML = upcoming.map(m => {
    const t1 = state.teams.find(t => t.id == m.team1Id);
    const t2 = state.teams.find(t => t.id == m.team2Id);

    return `
      <div class="card">
        <h3>${t1?.name} VS ${t2?.name}</h3>
      </div>
    `;
  }).join('');
}

function renderJogos() {
  document.getElementById('list-jogos').innerHTML =
    state.games.map(g => `<div class="card"><h3>${g.name}</h3><p>${g.genre}</p></div>`).join('');
}

function renderTimes() {
  document.getElementById('list-times').innerHTML =
    state.teams.map(t => `<div class="card"><h3>${t.name}</h3></div>`).join('');
}

function renderCompetidores() {
  document.getElementById('list-competidores').innerHTML =
    state.competitors.map(c => `<div class="card"><h3>${c.nickname}</h3></div>`).join('');
}

function renderConfrontos() {
  document.getElementById('list-confrontos').innerHTML =
    state.matches.map(m => {
      const t1 = state.teams.find(t => t.id == m.team1Id);
      const t2 = state.teams.find(t => t.id == m.team2Id);

      return `
        <div class="card">
          <h3>${t1?.name} ${m.score1} x ${m.score2} ${t2?.name}</h3>
          <button onclick="finishMatch(${m.id})">Finalizar</button>
        </div>
      `;
    }).join('');
}

/* CREATE */
async function saveItem(event, collection) {
  event.preventDefault();

  const data = Object.fromEntries(new FormData(event.target));

  if (data.teamId) data.teamId = Number(data.teamId);
  if (data.gameId) data.gameId = Number(data.gameId);
  if (data.team1Id) data.team1Id = Number(data.team1Id);
  if (data.team2Id) data.team2Id = Number(data.team2Id);

  await fetch(`${API}/${collection}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  await loadInitialData();
  renderAll();
  closeModal();
}

/* UPDATE MATCH */
async function finishMatch(id) {
  const s1 = prompt("Score 1:");
  const s2 = prompt("Score 2:");

  await fetch(`${API}/matches/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      score1: Number(s1),
      score2: Number(s2),
      status: "finished"
    })
  });

  await loadInitialData();
  renderAll();
}

/* MODAL */
const modal = document.getElementById('modal-container');
const formContent = document.getElementById('form-content');

function showForm(type) {
  modal.style.display = 'flex';

  let html = '';

  if (type === 'jogo') {
    html = `
      <form onsubmit="saveItem(event, 'games')">
        <input name="name" placeholder="Nome">
        <input name="genre" placeholder="Genero">
        <button>Salvar</button>
      </form>`;
  }

  if (type === 'time') {
    html = `
      <form onsubmit="saveItem(event, 'teams')">
        <input name="name" placeholder="Nome">
        <input name="color" type="color">
        <button>Salvar</button>
      </form>`;
  }

  if (type === 'competidor') {
    html = `
      <form onsubmit="saveItem(event, 'competitors')">
        <input name="name" placeholder="Nome">
        <input name="nickname" placeholder="Nick">
        <input name="teamId" placeholder="Team ID">
        <button>Salvar</button>
      </form>`;
  }

  if (type === 'confronto') {
    html = `
      <form onsubmit="saveItem(event, 'matches')">
        <input name="gameId" placeholder="Game ID">
        <input name="team1Id" placeholder="Team1 ID">
        <input name="team2Id" placeholder="Team2 ID">
        <input name="date" type="datetime-local">
        <button>Salvar</button>
      </form>`;
  }

  formContent.innerHTML = html;
}

function closeModal() {
  modal.style.display = 'none';
}
