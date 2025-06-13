const factions = {
    rome: ['légionnaire', 'Archer', 'Cavalier'],
    carthage: ['Éléphant de guerre', 'Lancier', 'Frondeur']
};
const TROOP_IDS = {
    'légionnaire': 1,
    'Archer': 2,
    'Cavalier': 3,
    'Éléphant de guerre': 4,
    'Lancier': 5,
    'Frondeur': 6
};

function getTroopIdByName(name) {
    return TROOP_IDS[name] ?? 0; // 0 si non trouvé
}

const playerTroops = { player1: [], player2: [] };
const selectedFactions = { player1: null, player2: null };
const troopPositions = {};

const boardGrid = document.getElementById('board-grid');
boardGrid.style.gridTemplateColumns = 'repeat(10, 60px)';
boardGrid.style.gridTemplateRows = 'repeat(10, 60px)';

// ------------------ INITIALISATION ------------------

function initialisation() {
    initFromURL();
    initTroopLists();
    initBoard();
}

function initFromURL() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('player1Faction') in factions) selectedFactions.player1 = params.get('player1Faction');
    if (params.get('player2Faction') in factions) selectedFactions.player2 = params.get('player2Faction');
}

function initTroopLists() {
    initTroopList('player1', selectedFactions.player1);
    initTroopList('player2', selectedFactions.player2);
}

function initBoard() {
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            boardGrid.appendChild(createCell(row, col));
        }
    }
}

// ------------------ TROOPS ------------------

function initTroopList(player, faction) {
    const list = document.getElementById(`${player}-troop-list`);
    list.innerHTML = '';
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    list.style.alignItems = player === 'player1' ? 'flex-start' : 'flex-end';

    factions[faction].forEach((name, index) => {
        list.appendChild(createTroop(player, name, index));
    });
}

function createTroop(player, name, index,) {
    const img = document.createElement('img');
    img.className = 'troop-item';
    img.src = `../image/${name}.png`;
    img.id = `${player}-troop-${index}`;
    img.draggable = true;
    img.dataset.player = player;
    img.textContent = name;
    setSize(img, 60, 60);
    img.addEventListener('dragstart', handleDragStart);
    return img;
}

// ------------------ BOARD CELLS ------------------


function createCell(row, col) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    cell.dataset.row = row;
    cell.dataset.col = col;

    // Détermine le joueur pour cette colonne
    let player = col < 5 ? 'player1' : 'player2';
    cell.dataset.allowedPlayer = player;

    // Récupère la faction choisie pour ce joueur
    const faction = selectedFactions[player];

    // Applique le damier selon la civilisation choisie
    if (faction === 'rome') {
        // Damier rouge pour Rome
        cell.style.backgroundColor = (row + col) % 2 === 0 ? '#ffcccc' : '#ffffff';
    } else if (faction === 'carthage') {
        // Damier bleu pour Carthage
        cell.style.backgroundColor = (row + col) % 2 === 0 ? '#cce0ff' : '#ffffff';
    } else {
        // Couleur par défaut si aucune faction
        cell.style.backgroundColor = '#ffffff';
    }

    // Ligne rouge centrale
    if (col === 4) {
        cell.style.borderRight = '3px solid red';
    }
    if (col === 5) {
        cell.style.borderLeft = '3px solid red';
    }

    cell.addEventListener('dragover', (e) => e.preventDefault());
    cell.addEventListener('drop', (e) => handleDrop(e, row, col, cell));

    // Permettre de retirer une troupe de la case (drag depuis la case)
    cell.addEventListener('dragstart', (e) => {
        if (cell.firstChild && cell.firstChild.draggable) {
            e.dataTransfer.setData('text/plain', cell.firstChild.id);
            e.dataTransfer.setData('from-cell', `${row}-${col}`);
        }
    });

    return cell;
}

// Permettre le drag sur les troupes placées
function handleDrop(e, row, col, cell) {
    e.preventDefault();
    const troopId = e.dataTransfer.getData('text/plain');
    const fromPos = e.dataTransfer.getData('from-cell');
    const troop = document.getElementById(troopId);
    const player = cell.dataset.allowedPlayer;

    // Vérifie que la troupe appartient au bon joueur
    if (!troop || troop.dataset.player !== player) return;

    // Si la case contient déjà une troupe, refuse le drop
    if (cell.hasChildNodes()) 
        {
            cell.removeChild(cell.firstChild);
        }
         return;

    // Si la troupe vient d'une autre case du plateau, retire-la de l'ancienne case
    if (fromPos) {
        const oldCell = document.querySelector(`.grid-cell[data-row="${fromPos.split('-')[0]}"][data-col="${fromPos.split('-')[1]}"]`);
        if (oldCell && oldCell.firstChild && oldCell.firstChild.id === troopId) {
            oldCell.removeChild(oldCell.firstChild);
            delete troopPositions[fromPos];
        }
        // Déplace la troupe sur la nouvelle case
        cell.appendChild(troop);
        troopPositions[`${row}-${col}`] = troopId;
        updateTroopTable(getPlayerLabel(player), troop.textContent, `${row}-${col}`);
        return;
    }

    // Si la troupe vient de la liste, clone comme avant
    const clone = troop.cloneNode(true);
    setSize(clone, 60, 60);
    clone.draggable = true;
    clone.addEventListener('dragstart', handleDragStart);
    cell.appendChild(clone);
    troopPositions[`${row}-${col}`] = troopId;
    updateTroopTable(getPlayerLabel(player), troop.textContent, `${row}-${col}`);
}
// Permettre le drag depuis la liste ET depuis le plateau
function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
    // Si c'est une troupe déjà placée, ajoute la position d'origine
    const parentCell = e.target.parentElement;
    if (parentCell.classList.contains('grid-cell')) {
        e.dataTransfer.setData('from-cell', `${parentCell.dataset.row}-${parentCell.dataset.col}`);
    }
}

// ------------------ EVENT HANDLERS ------------------

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
}

function handleDrop(e, row, col, cell) {
    e.preventDefault();
    const troopId = e.dataTransfer.getData('text/plain');
    const fromPos = e.dataTransfer.getData('from-cell');
    const troop = document.getElementById(troopId);
    const player = cell.dataset.allowedPlayer;

    // Vérifie que la troupe appartient au bon joueur
    if (!troop || troop.dataset.player !== player) return;

    // Supprimer la troupe existante sur la case
    while (cell.firstChild) {
        cell.removeChild(cell.firstChild);
    }

    // Si la troupe vient d'une autre case du plateau, retire-la de l'ancienne case
    if (fromPos) {
        const oldCell = document.querySelector(`.grid-cell[data-row="${fromPos.split('-')[0]}"][data-col="${fromPos.split('-')[1]}"]`);
        if (oldCell && oldCell.firstChild && oldCell.firstChild.id === troopId) {
            oldCell.removeChild(oldCell.firstChild);
            delete troopPositions[fromPos];
        }
    }

    // Ajouter la troupe dans la nouvelle case
    cell.appendChild(troop);
    troopPositions[`${row}-${col}`] = troopId;
    updateTroopTable(getPlayerLabel(player), troop.textContent, `${row}-${col}`);
}
function getTroopQuery() {
    const query = Object.entries(troopPositions).map(([pos, id]) => {
        const troop = document.getElementById(id);
        const name = troop?.textContent || '';
        const troopNumId = getTroopIdByName(name);
        const [player] = id.split('-');
        return `${player[6]}:${pos}:${troopNumId}`;
    }).join(',');
    console.log(`Query: ${query}`);
    return query;   
}

// ------------------ TABLE ------------------

function updateTroopTable(player, name, position) {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${player}</td><td>${name}</td><td>${position}</td>`;
}

function updateTroopTableFromPositions() {
    Object.entries(troopPositions).forEach(([pos, id]) => {
        const troop = document.getElementById(id);
        const name = troop?.textContent || 'Inconnu';
        const player = getPlayerLabel(id.startsWith('player1') ? 'player1' : 'player2');
        console.log(`Position: ${pos}, ID: ${id}, Player: ${player}, Name: ${name}`);
        updateTroopTable(player, name, pos);
    });
}

// ------------------ UTILS ------------------

function setSize(el, w, h) {
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
}

function getPlayerLabel(code) {
    return code === 'player1' ? 'Joueur 1' : 'Joueur 2';
}

// ------------------ START COMBAT ------------------
function startCombat() {
    //const troop_placement = document.getElementById('updateTroopTable').value;
    window.location.href = `../Combat/page_combat.html?troop_placement=${getTroopQuery()}`;
    console.log(`Démarrer le combat avec les troupes : ${getTroopQuery}`);
}

// ------------------ RUN ------------------

initialisation()