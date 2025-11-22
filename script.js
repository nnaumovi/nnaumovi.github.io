/*********************************************
 * UNIQUE ID GENERATOR
 *********************************************/
function createId() {
  return "id-" + Math.random().toString(36).substr(2, 9);
}

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
      teams = JSON.parse(saved);
    } catch (e) {
      console.error("Error loading saved data", e);
    }
  }
}

/*********************************************
 * INITIAL DATA
 *********************************************/
let teams = [
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

// Load saved data if exists
loadData();

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
        teamPoints: Number(member.teamPoints) || 0,
        personalPoints: Number(member.personalPoints) || 0,
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
    const options = teams.map(t => `<option value="${t.name}" ${t.name === p.team ? "selected" : ""}>${t.name}</option>`).join("");

    tbody.insertAdjacentHTML("beforeend", `
      <tr>
        <td>${i+1}</td>
        <td><input type="text" class="name-input" data-id="${p.id}" value="${p.name}"></td>
        <td><select class="team-select" data-id="${p.id}">${options}</select></td>
        <td><input type="number" class="team-input" data-id="${p.id}" value="${p.teamPoints}"></td>
        <td><input type="number" class="pers-input" data-id="${p.id}" value="${p.personalPoints}"></td>
        <td>${p.totalScore}</td>
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
      render();
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
      render();
    });
  });

  // Team points
  document.querySelectorAll(".team-input").forEach(input => {
    input.addEventListener("input", () => {
      const person = individuals.find(p => p.id === input.dataset.id);
      person.memberRef.teamPoints = Number(input.value) || 0;
      saveData();
      render();
    });
  });

  // Personal points
  document.querySelectorAll(".pers-input").forEach(input => {
    input.addEventListener("input", () => {
      const person = individuals.find(p => p.id === input.dataset.id);
      person.memberRef.personalPoints = Number(input.value) || 0;
      saveData();
      render();
    });
  });
}

document.getElementById("reset-btn").addEventListener("click", () => {
  if (!confirm("Are you sure you want to reset the scoreboard? This cannot be undone.")) return;

  // Clear localStorage
  localStorage.removeItem("thanksgivingScoreboard");

  // Reset default teams & members
  teams = [
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

  render();
});

document.getElementById("reset-scores-btn").addEventListener("click", () => {
  if (!confirm("Are you sure you want to reset all scores to zero? Names and teams will remain.")) return;

  // Loop through all teams and members, reset points
  teams.forEach(team => {
    team.members.forEach(member => {
      member.teamPoints = 0;
      member.personalPoints = 0;
    });
  });

  // Save the reset scores
  saveData();

  // Re-render tables
  render();
});



/*********************************************
 * INITIAL RENDER
 *********************************************/
render();
