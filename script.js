// ---------------------------
// DATA SECTION (example)
// ---------------------------
let teams = [
  {
    name: "Team 1",
    members: [
      { name: "Alice", teamPoints: 5, personalPoints: 10 },
      { name: "Bob", teamPoints: 8, personalPoints: 7 },
      { name: "Charlie", teamPoints: 6, personalPoints: 4 },
      { name: "Diana", teamPoints: 7, personalPoints: 9 }
    ]
  },
  {
    name: "Team 2",
    members: [
      { name: "Eve", teamPoints: 11, personalPoints: 4 },
      { name: "Frank", teamPoints: 3, personalPoints: 5 },
      { name: "Grace", teamPoints: 9, personalPoints: 2 },
      { name: "Henry", teamPoints: 4, personalPoints: 6 }
    ]
  },

  // Add teams 3–8...
];

// ---------------------------
// REBUILD RANKED DATA
// ---------------------------
function computeRankings() {
  // Team totals
  var teamRankings = teams.map(team => {
    const totalTeamScore = team.members.reduce((sum, m) => sum + Number(m.teamPoints), 0);
    return { name: team.name, totalTeamScore };
  });

  teamRankings.sort((a, b) => b.totalTeamScore - a.totalTeamScore);

  // Individual totals
  let individuals = [];
  teams.forEach(team => {
    team.members.forEach(member => {
      individuals.push({
        name: member.name,
        team: team.name,
        teamPoints: Number(member.teamPoints),
        personalPoints: Number(member.personalPoints),
        totalScore: Number(member.teamPoints) + Number(member.personalPoints),
        ref: member // keep pointer so edits update the real data
      });
    });
  });

  individuals.sort((a, b) => b.totalScore - a.totalScore);

  return { teamRankings, individuals };
}

// ---------------------------
// RENDER TABLES
// ---------------------------
function render() {
  const { teamRankings, individuals } = computeRankings();

  renderTeamTable(teamRankings);
  renderPersonTable(individuals);
}

function renderTeamTable(teamRankings) {
  const tbody = document.querySelector("#team-table tbody");
  tbody.innerHTML = "";

  teamRankings.forEach((t, i) => {
    const row = `
      <tr>
        <td>${i + 1}</td>
        <td>${t.name}</td>
        <td>${t.totalTeamScore}</td>
      </tr>
    `;
    tbody.insertAdjacentHTML("beforeend", row);
  });
}

function renderPersonTable(individuals) {
  const tbody = document.querySelector("#person-table tbody");
  tbody.innerHTML = "";

  individuals.forEach((p, i) => {
    const row = `
      <tr>
        <td>${i + 1}</td>
        <td>${p.name}</td>
        <td>${p.team}</td>
        <td><input type="number" class="team-input" data-name="${p.name}" value="${p.teamPoints}"></td>
        <td><input type="number" class="pers-input" data-name="${p.name}" value="${p.personalPoints}"></td>
        <td>${p.totalScore}</td>
      </tr>
    `;
    tbody.insertAdjacentHTML("beforeend", row);
  });

  addEventListeners(individuals);
}

// ---------------------------
// HANDLE EDITS
// ---------------------------
function addEventListeners(individuals) {
  document.querySelectorAll(".team-input").forEach(input => {
    input.addEventListener("input", e => {
      const person = individuals.find(p => p.name === input.dataset.name);
      person.ref.teamPoints = Number(input.value);
      render();
    });
  });

  document.querySelectorAll(".pers-input").forEach(input => {
    input.addEventListener("input", e => {
      const person = individuals.find(p => p.name === input.dataset.name);
      person.ref.personalPoints = Number(input.value);
      render();
    });
  });
}

// ---------------------------
// INITIAL RENDER
// ---------------------------
render();
