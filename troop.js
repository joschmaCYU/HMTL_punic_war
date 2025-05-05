const factions = {
    rome: ['Légionnaire', 'Archer', 'Cavalier'],
    carthage: ['Éléphant de guerre', 'Lancier', 'Frondeur']
};

const playerTroops = {
    player1: [],
    player2: []
};

const selectedFactions = {
    player1: null,
    player2: null
};

const troopPositions = {}; // Objet pour stocker les positions des troupes

// Initialisation de l'échiquier
const boardGrid = document.getElementById('board-grid');
boardGrid.style.gridTemplateColumns = 'repeat(10, 60px)';
boardGrid.style.gridTemplateRows = 'repeat(10, 60px)';

for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.dataset.row = row;
        cell.dataset.col = col;

        // Restriction de placement : Joueur 1 à gauche, Joueur 2 à droite
        if (col < 5) {
            cell.dataset.allowedPlayer = 'player1';
        } else {
            cell.dataset.allowedPlayer = 'player2';
        }

        cell.addEventListener('dragover', (event) => {
            event.preventDefault();
        });

        cell.addEventListener('drop', (event) => {
            event.preventDefault();
            const troopId = event.dataTransfer.getData('text/plain');
            const troopElement = document.getElementById(troopId);
            const allowedPlayer = cell.dataset.allowedPlayer;

            if (troopElement && !cell.hasChildNodes() && troopElement.dataset.player === allowedPlayer) {
                cell.appendChild(troopElement.cloneNode(true));
                troopElement.style.width = '60px';
                troopElement.style.height = '60px';

                // Enregistrer la position de la troupe
                const positionKey = `${row}-${col}`;
                troopPositions[positionKey] = troopId;
                console.log(`Troupe ${troopId} placée en position ${positionKey}`);
            }
        });

        boardGrid.appendChild(cell);
    }
}

// Fonction pour récupérer les positions des troupes
function getTroopPositions() {
    return troopPositions;
}

// Gestion du drag-and-drop
function initializeTroops(player, faction) {
    const troopList = document.querySelector(`#${player}-troop-list`);
    troopList.innerHTML = '';
    troopList.style.display = 'flex';
    troopList.style.flexDirection = 'column';
    troopList.style.alignItems = player === 'player1' ? 'flex-start' : 'flex-end';

    factions[faction].forEach((troop, index) => {
        const troopItem = document.createElement('div');
        troopItem.classList.add('troop-item');
        troopItem.id = `${player}-troop-${index}`;
        troopItem.draggable = true;
        troopItem.dataset.player = player;
        troopItem.textContent = troop;
        troopItem.style.width = '60px';
        troopItem.style.height = '60px';
        troopItem.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', event.target.id);
        });
        troopList.appendChild(troopItem);
    });

    localStorage.setItem('troopPositions', JSON.stringify(troopPositions));
    alert('Positions des troupes : ' + JSON.stringify(troopPositions));
}

// Mise à jour dynamique en fonction des factions choisies par les joueurs
const urlParams = new URLSearchParams(window.location.search);
const player1Faction = urlParams.get('player1Faction');
const player2Faction = urlParams.get('player2Faction');

if (player1Faction && factions[player1Faction]) {
    selectedFactions.player1 = player1Faction;
}
if (player2Faction && factions[player2Faction]) {
    selectedFactions.player2 = player2Faction;
}

initializeTroops('player1', selectedFactions.player1);
initializeTroops('player2', selectedFactions.player2);

// Ajustement des alignements
const player1TroopList = document.querySelector('#player1-troop-list');
const player2TroopList = document.querySelector('#player2-troop-list');

player1TroopList.style.alignItems = 'flex-end'; // Joueur 1 à droite
player2TroopList.style.alignItems = 'flex-start'; // Joueur 2 à gauche

document.getElementById('start-combat').addEventListener('click', () => {

});

const troopValues = {
    'Légionnairer': 1, // Rome
    'Archer': 2, // Rome
    'Cavalier': 3, // Rome
    'Éléphant de guerre': 4, // Carthage
    'Lancier': 5, // Carthage
    'Frondeur': 6  // Carthage
};


// Mettre à jour le tableau des troupes en utilisant troopPositions
function updateTroopTableFromPositions() {
    const tableBody = document.getElementById('troop-table-body');
    tableBody.innerHTML = ''; // Réinitialiser le tableau

    Object.entries(troopPositions).forEach(([position, troopValues]) => {
        const player = troopValues.startsWith('player1') ? 'Joueur 1' : 'Joueur 2';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${player}</td>
            <td>${troopValues}</td>
            <td>${position}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Exemple d'utilisation :
updateTroopTable('Joueur 1', 'Légionnaire', '0-0');
updateTroopTable('Joueur 2', 'Éléphant de guerre', '9-9');

// Modification de l'événement drop pour inclure la mise à jour du tableau
const boardGrid = document.getElementById('board-grid');
for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.dataset.row = row;
        cell.dataset.col = col;

        cell.addEventListener('dragover', (event) => {
            event.preventDefault();
        });

        cell.addEventListener('drop', (event) => {
            event.preventDefault();
           
            const troopElement = document.getElementById(troopValues);

            if (troopElement && !cell.hasChildNodes()) {
                cell.appendChild(troopElement.cloneNode(true));
                troopElement.style.width = '100%';
                troopElement.style.height = '100%';

                const positionKey = `${row}-${col}`;
                troopPositions[positionKey] = troopValues;

                const player = troopValues.startsWith('player1') ? 'Joueur 1' : 'Joueur 2';
                updateTroopTable(player, troopValues, positionKey);
            }
        });

        boardGrid.appendChild(cell);
    }
}

document.getElementById('start-combat').addEventListener('click', () => {
    const troopPositionsEncoded = encodeURIComponent(JSON.stringify(troopPositions));
    const playerTroopsEncoded = encodeURIComponent(JSON.stringify(playerTroops));
    
    // Rediriger vers la page de combat avec les données encodées dans l'URL
    window.location.replace(`page_combat.html?troopPositions=${troopPositionsEncoded}&playerTroops=${playerTroopsEncoded}`);
});

// Appeler la fonction pour initialiser le tableau
updateTroopTableFromPositions();