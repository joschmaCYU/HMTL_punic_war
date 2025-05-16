  // Récupérer les positions des troupes depuis localStorage
        const troopPositions = JSON.parse(localStorage.getItem('troopPositions')) || {};
        const playerTroops = JSON.parse(localStorage.getItem('playerTroops')) || {};

        const player1Info = document.getElementById('player1-troop-info');
        const player2Info = document.getElementById('player2-troop-info');

        // Afficher les troupes et leurs positions pour chaque joueur
        Object.entries(troopPositions).forEach(([position, troopId]) => {
            const troopName = playerTroops[troopId];
            const listItem = document.createElement('li');
            listItem.textContent = `${troopName} en position ${position}`;

            if (troopId.startsWith('player1')) {
                player1Info.appendChild(listItem);
            } else if (troopId.startsWith('player2')) {
                player2Info.appendChild(listItem);
            }
        });

        // Initialisation de la grille
        const grid = document.querySelector('.grid');
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = row;
                cell.dataset.col = col;

                // Vérifier si une troupe est placée sur cette case
                const positionKey = `${row}-${col}`;
                if (troopPositions[positionKey]) {
                    const troopId = troopPositions[positionKey];
                    const troopName = playerTroops[troopId];

                    // Ajouter une représentation visuelle de la troupe
                    const troopElement = document.createElement('div');
                    troopElement.textContent = troopName;
                    troopElement.style.backgroundColor = troopId.startsWith('player1') ? '#007BFF' : '#FF5733';
                    troopElement.style.color = 'white';
                    troopElement.style.textAlign = 'center';
                    troopElement.style.fontSize = '12px';
                    troopElement.style.padding = '5px';
                    troopElement.style.borderRadius = '5px';

                    cell.appendChild(troopElement);
                }

                grid.appendChild(cell);
            }
        }