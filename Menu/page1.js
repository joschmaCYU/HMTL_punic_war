
function startGame() {
    const player1Faction = factions[playerSelections.player1].factionName;
    const player2Faction = factions[playerSelections.player2].factionName;

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
    
