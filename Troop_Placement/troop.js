const factions = {
    rome: ['Legionnaire', 'Archer', 'Cavalier'],
    carthage: ['Elephants', 'Lancier', 'Frondeur']
};
const TROOP_IDS = {
    'Legionnaire': 1,
    'Archer': 2,
    'Cavalier': 3,
    'Elephants': 4,
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

let troop_number_player1 = [{ "Legionnaire": 2 }, { "Archer": 3 }, { "Cavalier": 5 }, { "Elephants": 5 }, { "Lancier": 5 }, { "Frondeur": 5 }];
let troop_number_player2 = [{ "Legionnaire": 2 }, { "Archer": 3 }, { "Cavalier": 5 }, { "Elephants": 5 }, { "Lancier": 5 }, { "Frondeur": 5 }];

// helper to pick the right count array
function getTroopCounts(player) {
    return player === 'player1' ? troop_number_player1 : troop_number_player2;
}

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
    if (!faction) return;

    // If troop count is 0 do not place the troop
    const availableTroops = factions[faction].filter(name => {
        const countObj = getTroopCounts(player).find(o => o[name] !== undefined);
        return countObj && countObj[name] > 0;
    });

    availableTroops.forEach((name, index) => {
        list.appendChild(createTroop(player, name, index));
    });

}

function createTroop(player, name, index) {
    const img = document.createElement('img');
    img.className = 'troop-item';
    img.src = `../image/${name}.png`;
    img.id = `${player}-troop-${index}`;
    img.draggable = true;
    img.dataset.player = player;

    // Add troop_number for each troop
    const countObj = getTroopCounts(player).find(obj => obj[name] !== undefined);
    const count = countObj ? countObj[name] : 0;
    img.dataset.count = count;
    img.dataset.name = name;                 // add troop name
    img.title = `${name} (${count})`;

    // wrap icon + badge
    const wrapper = document.createElement('div');
    wrapper.className = 'troop-item-wrapper';
    wrapper.appendChild(img);

    const badge = document.createElement('span');
    badge.className = 'troop-count';
    badge.textContent = `x${count}`;
    wrapper.appendChild(badge);

    setSize(img, 60, 60);
    img.addEventListener('dragstart', handleDragStart);
    return wrapper;
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

// ------------------ EVENT HANDLERS ------------------

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
}

function handleDrop(e, row, col, cell) {
    e.preventDefault();
    // on récupère si l’on vient d’une cellule et l’ID de la troupe
    const fromPos = e.dataTransfer.getData('from-cell');
    const troopId = e.dataTransfer.getData('text/plain');
    const troop = document.getElementById(troopId);
    const player = cell.dataset.allowedPlayer;

    // Vérifie que la troupe appartient au bon joueur
    if (!troop || troop.dataset.player !== player) return;

    // Ne supprime pas la troupe existante sur la case
    while (cell.firstChild) {
        return;
    }
    // si nouveau placement depuis la liste, on clone l’image
    if (!fromPos) {
        const name = troop.dataset.name;
        const cntObj = getTroopCounts(player).find(o => o[name] !== undefined);
        if (cntObj) {
            cntObj[name]--;
            // rafraîchir la liste latérale
            initTroopList(player, selectedFactions[player]);
            // cloner l’élément pour le plateau
            const clone = troop.cloneNode(true);
            clone.id = `${troopId}-${row}-${col}`;
            clone.draggable = true;
            clone.dataset.player = troop.dataset.player;
            clone.addEventListener('dragstart', handleDragStart);
            cell.appendChild(clone);
            troopPositions[`${row}-${col}`] = clone.id;
            updateTroopTable(getPlayerLabel(player), name, `${row}-${col}`);
        }
        return;
    }

    // Si la troupe si elle est sur le plateau
    if (fromPos) {
        const oldCell = document.querySelector(`.grid-cell[data-row="${fromPos.split('-')[0]}"][data-col="${fromPos.split('-')[1]}"]`);
        if (oldCell && oldCell.firstChild && oldCell.firstChild.id === troopId) {
            oldCell.removeChild(oldCell.firstChild);
            delete troopPositions[fromPos];
        }
    } else {
        const name = troop.dataset.name;
        const cntObj = getTroopCounts(player).find(o => o[name] !== undefined);
        if (cntObj) {
            cntObj[name]--;
            const newCount = cntObj[name];
            const wrapper = troop.parentNode;
            const badge = wrapper.querySelector('.troop-count');
            badge.textContent = `x${newCount}`;

            troop.dataset.count = newCount;
            troop.title = `${name} (${newCount})`;
            // ne supprime l’icône que si le compte atteint 0
            if (newCount <= 0) {
                const wrapper = troop.parentNode;
                wrapper.remove();
            } else {
                const list = document.getElementById(`${player}-troop-list`);
                list.innerHTML = '';
                list.style.display = 'flex';
                list.style.flexDirection = 'column';
                list.style.alignItems = player === 'player1' ? 'flex-start' : 'flex-end';
                const faction = selectedFactions[player];
                factions[faction].forEach((troopName, idx) => {
                    const countObj = getTroopCounts(player).find(o => o[troopName] !== undefined);
                    if (countObj && countObj[troopName] > 0) {
                        list.appendChild(createTroop(player, troopName, idx));
                    }
                });
            }
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
        const name = troop?.dataset.name || '';
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
    // comptage des troupes par joueur
    const entries = Object.values(troopPositions);
    const count1 = entries.filter(id => id.startsWith('player1-')).length;
    const count2 = entries.filter(id => id.startsWith('player2-')).length;
    if (count1 === 0) {
        alert('Joueur 1 doit placer au moins une troupe');
        return;
    }
    if (count2 === 0) {
        alert('Joueur 2 doit placer au moins une troupe');
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const p1 = params.get('player1Faction');
    const p2 = params.get('player2Faction');

    const query = getTroopQuery();
    console.log(`Démarrer le combat avec les troupes : ${query}`);
    window.location.href = `../Combat/page_combat.html?troop_placement=${query}&player1Faction=${p1}&player2Faction=${p2}`;
    
}

// ------------------ RUN ------------------

initialisation()