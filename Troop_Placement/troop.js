const factions = {
    rome: ['légionnaire', 'Archer', 'Cavalier'],
    carthage: ['Éléphant de guerre', 'Lancier', 'Frondeur']
};

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
    cell.dataset.allowedPlayer = col < 5 ? 'player1' : 'player2';

    cell.addEventListener('dragover', (e) => e.preventDefault());
    cell.addEventListener('drop', (e) => handleDrop(e, row, col, cell));

    return cell;
}

// ------------------ EVENT HANDLERS ------------------

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
}

function handleDrop(e, row, col, cell) {
    e.preventDefault();
    const troopId = e.dataTransfer.getData('text/plain');
    const troop = document.getElementById(troopId);
    const player = cell.dataset.allowedPlayer;

    if (!troop || cell.hasChildNodes() || troop.dataset.player !== player) return;

    const clone = troop.cloneNode(true);
    setSize(clone, 60, 60);
    cell.appendChild(clone);

    const pos = `${row}-${col}`;
    troopPositions[pos] = troopId;

    updateTroopTable(getPlayerLabel(player), troop.textContent, pos);

    console.log(`Position: ${pos}, ID: ${troopId}, Player: ${player}`);
}

function getTroopQuery() {
    const query = Object.entries(troopPositions).map(([pos, id]) => {
        const [player, index] = id.split('-').slice(0, 2);
        return `${player[6]}:${pos}`;
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
    console.log(`Démarrer le combat avec les troupes : ${troop_placement}`);
}

// ------------------ RUN ------------------

initialisation()