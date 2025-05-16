
function startGame() {
    const player1Faction = document.getElementById('player1-faction').value;
    const player2Faction = document.getElementById('player2-faction').value;

    // Redirige vers la page de placement des troupes avec les factions sélectionnées
    window.location.href = `Troop_Placement/page2.html?player1Faction=${player1Faction}&player2Faction=${player2Faction}`;
}

const factions = [
    { factionName: "rome", img: "image/bouclier_rouge.png" },
    { factionName: "carthage", img: "image/bouclier_bleu.png" }
];

let playerSelections = {
    player1: 0,
    player2: 0
};

function updateFactionDisplay(playerId) {
    const index = playerSelections[playerId];
    const faction = factions[index];
    document.getElementById(`${playerId}-image`).src = faction.img;
}

function nextFaction(playerId) {
    playerSelections[playerId] = (playerSelections[playerId] + 1) % factions.length;
    updateFactionDisplay(playerId);
}

function prevFaction(playerId) {
    playerSelections[playerId] = (playerSelections[playerId] - 1 + factions.length) % factions.length;
    updateFactionDisplay(playerId);
}

function validateFaction(playerId) {
    const selected = factions[playerSelections[playerId]].factionName;
    alert(`${playerId} a choisi : ${selected}`);
}

