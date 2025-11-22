/*********************************************
 * LOCAL STORAGE HELPERS
 *********************************************/

// Save entire data structure
function saveData() {
  localStorage.setItem("thanksgivingScoreboard", JSON.stringify(teams));
}

// Load existing data if it exists
function loadData() {
  const saved = localStorage.getItem("thanksgivingScoreboard");
  if (saved) {
    try {
      teams = JSON.parse(saved);
    } catch (e) {
      console.error("Error loading saved data", e);
    }
  }
}


/*********************************************
 * INITIAL DATA (only used if no save exists)
 *********************************************/
let teams = [
  { name: "Team 1", members: [ 
    {name:"A1",teamPoints:0,personalPoints:0},
    {name:"A2",teamPoints:0,personalPoints:0},
    {name:"A3",teamPoints:0,personalPoints:0}
  ]},
  { name: "Team 2", members: [
    {name:"B1",teamPoints:0,personalPoints:0},
    {name:"B2",teamPoints:0,personalPoints:0},
    {name:"B3",teamPoints:0,personalPoints:0}
  ]},
  { name: "Team 3", members: [
    {name:"C1",teamPoints:0,personalPoints:0},
    {name:"C2",teamPoints:0,personalPoints:0},
    {name:"C3",teamPoints:0,personalPoints:0}
  ]},
  { name: "Team 4", members: [
    {name:"D1",teamPoints:0,personalPoints:0},
    {name:"D2",teamPoints:0,personalPoints:0},
    {name:"D3",teamPoints:0,personalPoints:0}
  ]},
  { name: "Team 5", members: [
    {name:"E1",teamPoints:0,personalPoints:0},
    {name:"E2",teamPoints:0,personalPoints:0},
    {name:"E3",teamPoints:0,personalPoints:0}
  ]},
  { name: "Team 6", members: [
    {name:"F1",teamPoints:0,personalPoints:0},
    {name:"F2",teamPoints:0,personalPoints:0},
    {name:"F3",teamPoints:0,personalPoints:0}
  ]},
  { name: "Team 7", members: [
    {name:"G1",teamPoints:0,personalPoints:0},
    {name:"G2",teamPoints:0,personalPoints:0},
    {name:"G3",teamPoints:0,personalPoints:0}
  ]},
  { name: "Team 8", members: [
    {name:"H1",teamPoints:0,personalPoints:0},
    {name:"H2",teamPoints:0,personalPoints:0},
    {name:"H3",teamPoints:0,personalPoints:0}
  ]}
];

// Load saved data (if any)
loadData();


/*********************************************
 * COMPUTE RANKINGS
 *********************************************/
function computeRankings() {
  const teamRankings = teams.map(team => ({
    name: team.name,
    totalTeamScore: team.members.reduce((a, m) => a + Number(m.teamPoints), 0)
  }));

  teamRankings.sort((a, b) => b.totalTeamScore - a.totalTeamScore);

  let individuals = [];
  teams.forEach(team => {
    team.members.forEach(member => {
      individuals.push({
        name: member.name,
        team: team.name,
        teamRef: team,
        memberRef: member,
        teamPoints: Number(member.teamPoints),
        personalPoints: Number(member.personalPoints),
        totalScore: Number(member.teamPoints) + Number(member.personalPoints)
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
  tbody.innerHTML = "";

  individuals.forEach((p, i) => {
    const teamOptions = teams
      .map(t => `<option value="${t.name}" ${t.name === p.team ? "selected" : ""}>${t.name}</option>`)
      .join("");

    tbody.insertAdjacentHTML("beforeend", `
      <tr>
        <td>${i+1}</td>

        <td>
          <input type="text" class="name-input" data-id="${p.name}" value="${p.name}">
        </td>

        <td>
          <select class="team-select" data-id="${p.name}">
            ${teamOptions}
          </select>
        </td>

        <td>
          <input type="number" class="team-input" data-id="${p.name}" value="${p.teamPoints}">
        </td>

        <td>
          <input type="number" class="pers-input" data-id="${p.name}" value="${p.personalPoints}">
        </td>

        <td>${p.totalScore}</td>
      </tr>
    `);
  });

  addListeners(individuals);
}


/*********************************************
 * EVENT LISTENERS — with auto-save!
 *********************************************/
function addListeners(individuals) {

  // Name editing
  document.querySelectorAll(".name-input").forEach(input => {
    input.addEventListener("input", () => {
      const person = individuals.find(p => p.memberRef.name === input.dataset.id);
      person.memberRef.name = input.value;

      saveData();
      render();
    });
  });

  // Team changes
  document.querySelectorAll(".team-select").forEach(sel => {
    sel.addEventListener("change", () => {

      const person = individuals.find(p => p.memberRef.name === sel.dataset.id);

      // Remove from old team
      person.teamRef.members = person.teamRef.members.filter(m => m !== person.memberRef);

      // Add to new team
      const newTeam = teams.find(t => t.name === sel.value);
      newTeam.members.push(person.memberRef);

      saveData();
      render();
    });
  });

  // Team points
  document.querySelectorAll(".team-input").forEach(input => {
    input.addEventListener("input", () => {
      const person = individuals.find(p => p.memberRef.name === input.dataset.id);
      person.memberRef.teamPoints = Number(input.value);

      saveData();
      render();
    });
  });

  // Personal points
  document.querySelectorAll(".pers-input").forEach(input => {
    input.addEventListener("input", () => {
      const person = individuals.find(p => p.memberRef.name === input.dataset.id);
      person.memberRef.personalPoints = Number(input.value);

      saveData();
      render();
    });
  });
}


/*********************************************
 * INITIAL RENDER
 *********************************************/
render();
