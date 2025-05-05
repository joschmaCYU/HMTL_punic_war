function startGame() {
    const player1Faction = document.getElementById('player1-faction').value;
    const player2Faction = document.getElementById('player2-faction').value;

    // Redirige vers la page de placement des troupes avec les factions sélectionnées
    window.location.href = `troop_placement.html?player1Faction=${player1Faction}&player2Faction=${player2Faction}`;
}

function updateFactionColor(player) {
    const selectElement = document.getElementById(`${player}-faction`);
    const selectedFaction = selectElement.value;

    // Réinitialiser les classes pour les couleurs et padding
    selectElement.classList.remove('rome', 'carthage', 'rome-padding', 'carthage-padding');

    if (selectedFaction === "rome") {
        selectElement.classList.add('rome', 'rome-padding');
    } else if (selectedFaction === "carthage") {
        selectElement.classList.add('carthage', 'carthage-padding');
    }
}
