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

let teams = JSON.parse(JSON.stringify(defaultTeams));

/*********************************************
 * LOCAL STORAGE
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
 * COMPUTE SCORES
 *********************************************/
function computeScores() {
  const teamScores = teams.map(t => ({
    name: t.name,
    total: t.members.reduce((sum, m) => sum + (Number(m.teamPoints) || 0), 0)
  }));
  teamScores.sort((a, b) => b.total - a.total);

  const individuals = [];
  teams.forEach(team => {
    team.members.forEach(m => {
      individuals.push({
        id: m.id,
        name: m.name,
        team: team.name,
        teamRef: team,
        memberRef: m,
        totalScore: (Number(m.teamPoints) || 0) + (Number(m.personalPoints) || 0)
      });
    });
  });
  individuals.sort((a, b) => b.totalScore - a.totalScore);

  return { teamScores, individuals };
}

/*********************************************
 * RENDER TABLES
 *********************************************/
function renderTables() {
  const { teamScores, individuals } = computeScores();

  // Team table
  const teamTbody = document.querySelector("#team-table tbody");
  if (teamTbody) {
    teamTbody.innerHTML = "";
    teamScores.forEach((t, i) => {
      teamTbody.insertAdjacentHTML("beforeend", `
        <tr>
          <td>${i+1}</td>
          <td>${t.name}</td>
          <td>${t.total}</td>
        </tr>
      `);
    });
  }

  // Person table
  const personTbody = document.querySelector("#person-table tbody");
  if (!personTbody) return;
  personTbody.innerHTML = "";
  individuals.forEach((p, i) => {
    const options = teams.map(t => `<option value="${t.name}" ${t.name===p.team?"selected":""}>${t.name}</option>`).join("");
    personTbody.insertAdjacentHTML("beforeend", `
      <tr data-id="${p.id}">
        <td>${i+1}</td>
        <td><input type="text" class="name-input" value="${p.name}"></td>
        <td><select class="team-select">${options}</select></td>
        <td><input type="number" class="team-input" value="${p.memberRef.teamPoints}"></td>
        <td><input type="number" class="personal-input" value="${p.memberRef.personalPoints}"></td>
        <td class="total-cell">${p.totalScore}</td>
      </tr>
    `);
  });

  addPersonListeners();
}

/*********************************************
 * PERSON INPUT LISTENERS
 *********************************************/
function addPersonListeners() {
  document.querySelectorAll("#person-table tbody tr").forEach(row => {
    const id = row.dataset.id;
    const member = teams.flatMap(t => t.members).find(m => m.id===id);

    // Name
    row.querySelector(".name-input").oninput = e => {
      member.name = e.target.value;
      saveData();
      renderTables(); // re-render for auto-sort
    };

    // Team
    row.querySelector(".team-select").onchange = e => {
      const oldTeam = teams.find(t => t.members.some(m=>m.id===id));
      oldTeam.members = oldTeam.members.filter(m => m.id !== id);
      const newTeam = teams.find(t => t.name === e.target.value);
      newTeam.members.push(member);
      saveData();
      renderTables();
    };

    // Team points
    row.querySelector(".team-input").oninput = e => {
      member.teamPoints = Number(e.target.value) || 0;
      saveData();
      renderTables(); // re-render for updated totals & sorting
    };

    // Personal points
    row.querySelector(".personal-input").oninput = e => {
      member.personalPoints = Number(e.target.value) || 0;
      saveData();
      renderTables(); // re-render for updated totals & sorting
    };
  });
}

/*********************************************
 * RESET BUTTONS
 *********************************************/
document.getElementById("reset-btn")?.addEventListener("click", () => {
  if(!confirm("Reset full scoreboard?")) return;
  teams = JSON.parse(JSON.stringify(defaultTeams));
  saveData();
  renderTables();
});

document.getElementById("reset-scores-btn")?.addEventListener("click", () => {
  if(!confirm("Reset all scores to zero?")) return;
  teams.forEach(t => t.members.forEach(m => { m.teamPoints=0; m.personalPoints=0; }));
  saveData();
  renderTables();
});

/*********************************************
 * INITIAL LOAD
 *********************************************/
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  renderTables();
});
