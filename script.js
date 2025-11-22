/*********************************************
 * UNIQUE ID GENERATOR
 *********************************************/
function createId() {
  return "id-" + Math.random().toString(36).substr(2, 9);
}

/*********************************************
 * INITIAL DATA
 *********************************************/
let defaultTeams = [
  { name: "Team 1", members: [ 
    {id:createId(), name:"A1", teamPoints:0, personalPoints:0},
    {id:createId(), name:"A2", teamPoints:0, personalPoints:0},
    {id:createId(), name:"A3", teamPoints:0, personalPoints:0}
  ]},
  { name: "Team 2", members: [
    {id:createId(), name:"B1", teamPoints:0, personalPoints:0},
    {id:createId(), name:"B2", teamPoints:0, personalPoints:0},
    {id:createId(), name:"B3", teamPoints:0, personalPoints:0}
  ]},
  { name: "Team 3", members: [
    {id:createId(), name:"C1", teamPoints:0, personalPoints:0},
    {id:createId(), name:"C2", teamPoints:0, personalPoints:0},
    {id:createId(), name:"C3", teamPoints:0, personalPoints:0}
  ]},
  { name: "Team 4", members: [
    {id:createId(), name:"D1", teamPoints:0, personalPoints:0},
    {id:createId(), name:"D2", teamPoints:0, personalPoints:0},
    {id:createId(), name:"D3", teamPoints:0, personalPoints:0}
  ]},
  { name: "Team 5", members: [
    {id:createId(), name:"E1", teamPoints:0, personalPoints:0},
    {id:createId(), name:"E2", teamPoints:0, personalPoints:0},
    {id:createId(), name:"E3", teamPoints:0, personalPoints:0}
  ]},
  { name: "Team 6", members: [
    {id:createId(), name:"F1", teamPoints:0, personalPoints:0},
    {id:createId(), name:"F2", teamPoints:0, personalPoints:0},
    {id:createId(), name:"F3", teamPoints:0, personalPoints:0}
  ]},
  { name: "Team 7", members: [
    {id:createId(), name:"G1", teamPoints:0, personalPoints:0},
    {id:createId(), name:"G2", teamPoints:0, personalPoints:0},
    {id:createId(), name:"G3", teamPoints:0, personalPoints:0}
  ]},
  { name: "Team 8", members: [
    {id:createId(), name:"H1", teamPoints:0, personalPoints:0},
    {id:createId(), name:"H2", teamPoints:0, personalPoints:0},
    {id:createId(), name:"H3", teamPoints:0, personalPoints:0}
  ]}
];

// Working teams
let teams = JSON.parse(JSON.stringify(defaultTeams));

/*********************************************
 * LOCAL STORAGE HELPERS
 *********************************************/
function saveData() {
  localStorage.setItem("thanksgivingScoreboard", JSON.stringify(teams));
}

function loadData() {
  const saved = localStorage.getItem("thanksgivingScoreboard");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].members) {
        teams = parsed;
      }
    } catch (e) {
      console.error("Error loading saved data", e);
    }
  }
}

/*********************************************
 * COMPUTE RANKINGS & TOTAL SCORES
 *********************************************/
function computeRankings() {
  // Team rankings
  const teamRankings = teams.map(team => {
    const totalTeamScore = team.members.reduce((sum, m) => sum + (Number(m.teamPoints) || 0), 0);
    return { name: team.name, totalTeamScore };
  });
  teamRankings.sort((a, b) => b.totalTeamScore - a.totalTeamScore);

  // Individual rankings
  let individuals = [];
  teams.forEach(team => {
    team.members.forEach(member => {
      const totalScore = (Number(member.teamPoints) || 0) + (Number(member.personalPoints) || 0);
      individuals.push({
        id: member.id,
        name: member.name,
        team: team.name,
        teamRef: team,
        memberRef: member,
        totalScore
      });
    });
  });
  individuals.sort((a, b) => b.totalScore - a.totalScore);

  return { teamRankings, individuals };
}

/*********************************************
 * RENDERING
 *********************************************/
function render() {
  const { teamRankings, individuals } = computeRankings();
  renderTeamTable(teamRankings);
  renderPersonTable(individuals);
}

function renderTeamTable(teamRankings) {
  const tbody = document.querySelector("#team-table tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  teamRankings.forEach((t, i) => {
    tbody.insertAdjacentHTML("beforeend", `
      <tr>
        <td>${i+1}</td>
        <td>${t.name}</td>
        <td>${t.totalTeamScore}</td>
      </tr>
    `);
  });
}

function renderPersonTable(individuals) {
  const tbody = document.querySelector("#person-table tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  individuals.forEach((p, i) => {
    const options = teams.map(t => `<option value="${t.name}" ${t.name === p.team ? "selected" : ""}>${t.name}</option>`).join("");

    tbody.insertAdjacentHTML("beforeend", `
      <tr>
        <td>${i+1}</td>
        <td><input type="text" class="name-input" data-id="${p.id}" value="${p.name}"></td>
        <td><select class="team-select" data-id="${p.id}">${options}</select></td>
        <td><input type="number" class="team-input" data-id="${p.id}" value="${p.memberRef.teamPoints}"></td>
        <td><input type="number" class="pers-input" data-id="${p.id}" value="${p.memberRef.personalPoints}"></td>
        <td class="total-cell" data-id="${p.id}">${p.totalScore}</td>
      </tr>
    `);
  });

  addListeners(individuals);
}

/*********************************************
 * EVENT LISTENERS
 *********************************************/
function addListeners(individuals) {
  // Name edit
  document.querySelectorAll(".name-input").forEach(input => {
    input.addEventListener("input", () => {
      const person = individuals.find(p => p.id === input.dataset.id);
      person.memberRef.name = input.value;
      saveData();
    });
  });

  // Team change
  document.querySelectorAll(".team-select").forEach(sel => {
    sel.addEventListener("change", () => {
      const person = individuals.find(p => p.id === sel.dataset.id);

      // Remove from old team
      person.teamRef.members = person.teamRef.members.filter(m => m.id !== person.id);

      // Add to new team
      const newTeam = teams.find(t => t.name === sel.value);
      newTeam.members.push(person.memberRef);

      saveData();
      render(); // re-render table to update team display
    });
  });

  // Team points
  document.querySelectorAll(".team-input").forEach(input => {
    input.addEventListener("input", () => {
      const person = individuals.find(p => p.id === input.dataset.id);
      person.memberRef.teamPoints = Number(input.value) || 0;
      updateTotalCell(person.id);
      saveData();
      renderTeamTable(computeRankings().teamRankings); // update team totals
    });
  });

  // Personal points
  document.querySelectorAll(".pers-input").forEach(input => {
    input.addEventListener("input", () => {
      const person = individuals.find(p => p.id === input.dataset.id);
      person.memberRef.personalPoints = Number(input.value) || 0;
      updateTotalCell(person.id);
      saveData();
    });
  });
}

// Update total score cell for a single person
function updateTotalCell(id) {
  const person = teams.flatMap(t => t.members).find(m => m.id === id);
  if (!person) return;
  const total = (Number(person.teamPoints) || 0) + (Number(person.personalPoints) || 0);
  const cell = document.querySelector(`.total-cell[data-id="${id}"]`);
  if (cell) cell.textContent = total;
}

/*********************************************
 * RESET BUTTONS
 *********************************************/
document.getElementById("reset-btn")?.addEventListener("click", () => {
  if (!confirm("Are you sure you want to reset the scoreboard? This cannot be undone.")) return;

  teams = JSON.parse(JSON.stringify(defaultTeams));
  saveData();
  render();
});

document.getElementById("reset-scores-btn")?.addEventListener("click", () => {
  if (!confirm("Are you sure you want to reset all scores to zero? Names and teams will remain.")) return;

  teams.forEach(team => {
    team.members.forEach(member => {
      member.teamPoints = 0;
      member.personalPoints = 0;
    });
  });
  saveData();
  render();
});

/*********************************************
 * INITIAL LOAD
 *********************************************/
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  render();
});
