// -----------------------------------
// INITIAL DATA (8 teams, 3 people each)
// -----------------------------------
let teams = [
  { name: "Team 1", members: [ {name:"A1",teamPoints:0,personalPoints:0}, {name:"A2",teamPoints:0,personalPoints:0}, {name:"A3",teamPoints:0,personalPoints:0} ]},
  { name: "Team 2", members: [ {name:"B1",teamPoints:0,personalPoints:0}, {name:"B2",teamPoints:0,personalPoints:0}, {name:"B3",teamPoints:0,personalPoints:0} ]},
  { name: "Team 3", members: [ {name:"C1",teamPoints:0,personalPoints:0}, {name:"C2",teamPoints:0,personalPoints:0}, {name:"C3",teamPoints:0,personalPoints:0} ]},
  { name: "Team 4", members: [ {name:"D1",teamPoints:0,personalPoints:0}, {name:"D2",teamPoints:0,personalPoints:0}, {name:"D3",teamPoints:0,personalPoints:0} ]},
  { name: "Team 5", members: [ {name:"E1",teamPoints:0,personalPoints:0}, {name:"E2",teamPoints:0,personalPoints:0}, {name:"E3",teamPoints:0,personalPoints:0} ]},
  { name: "Team 6", members: [ {name:"F1",teamPoints:0,personalPoints:0}, {name:"F2",teamPoints:0,personalPoints:0}, {name:"F3",teamPoints:0,personalPoints:0} ]},
  { name: "Team 7", members: [ {name:"G1",teamPoints:0,personalPoints:0}, {name:"G2",teamPoints:0,personalPoints:0}, {name:"G3",teamPoints:0,personalPoints:0} ]},
  { name: "Team 8", members: [ {name:"H1",teamPoints:0,personalPoints:0}, {name:"H2",teamPoints:0,personalPoints:0}, {name:"H3",teamPoints:0,personalPoints:0} ]}
];

// -----------------------------------
// COMPUTE RANKINGS
// -----------------------------------
function computeRankings() {
  // team totals
  const teamRankings = teams.map(team => ({
    name: team.name,
    totalTeamScore: team.members.reduce((a, m) => a + Number(m.teamPoints), 0)
  }));

  teamRankings.sort((a, b) => b.totalTeamScore - a.totalTeamScore);

  // individuals
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

// -----------------------------------
// RENDER
// -----------------------------------
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
          <select class="team-select" data-name="${p.name}">
            ${teamOptions}
          </select>
        </td>

        <td>
          <input type="number" class="team-input" data-name="${p.name}" value="${p.teamPoints}">
        </td>

        <td>
          <input type="number" class="pers-input" data-name="${p.name}" value="${p.personalPoints}">
        </td>

        <td>${p.totalScore}</td>
      </tr>
    `);
  });

  addListeners(individuals);
}

// -----------------------------------
// EVENT LISTENERS
// -----------------------------------
function addListeners(individuals) {
  // name changes
  document.querySelectorAll(".name-input").forEach(input => {
    input.addEventListener("input", () => {
      const person = individuals.find(p => p.name === input.dataset.id);
      person.memberRef.name = input.value;
      render();
    });
  });

  // change teams
  document.querySelectorAll(".team-select").forEach(sel => {
    sel.addEventListener("change", () => {
      const person = individuals.find(p => p.name === sel.dataset.name);

      // remove from old team
      person.teamRef.members = person.teamRef.members.filter(m => m !== person.memberRef);

      // add to new team
      const newTeam = teams.find(t => t.name === sel.value);
      newTeam.members.push(person.memberRef);

      render();
    });
  });

  // team point edits
  document.querySelectorAll(".team-input").forEach(input => {
    input.addEventListener("input", () => {
      const person = individuals.find(p => p.name === input.dataset.name);
      person.memberRef.teamPoints = Number(input.value);
      render();
    });
  });

  // personal point edits
  document.querySelectorAll(".pers-input").forEach(input => {
    input.addEventListener("input", () => {
      const person = individuals.find(p => p.name === input.dataset.name);
      person.memberRef.personalPoints = Number(input.value);
      render();
    });
  });
}

// initial render
render();
