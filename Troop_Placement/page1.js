function startGame() {
    const player1Faction = document.getElementById('player1-faction').value;
    const player2Faction = document.getElementById('player2-faction').value;

    // Redirige vers la page de placement des troupes avec les factions sélectionnées
    window.location.href = `Troop_Placement/troop_placement.html?player1Faction=${player1Faction}&player2Faction=${player2Faction}`;
}
