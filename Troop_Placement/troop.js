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

let troop_number_player1 = [{ "Legionnaire": 5 }, { "Archer": 3 }, { "Cavalier": 2 }, { "Elephants": 2 }, { "Lancier": 5 }, { "Frondeur": 3 }];
let troop_number_player2 = [{ "Legionnaire": 5 }, { "Archer": 3 }, { "Cavalier": 2 }, { "Elephants": 2 }, { "Lancier": 5 }, { "Frondeur": 3 }];

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
    if (cell.firstChild) {
        return;
    }

    if (!fromPos) {
        const name = troop.dataset.name;
        const cntObj = getTroopCounts(player).find(o => o[name] !== undefined);
        if (cntObj) {
            cntObj[name]--;
            // si nouveau placement depuis la liste, on clone l’image
            initTroopList(player, selectedFactions[player]);

            // cloner l’élément pour le plateau
            const clone = troop.cloneNode(true);
            clone.id = `${troopId}-${row}-${col}`;
            clone.draggable = true;
            clone.dataset.player = troop.dataset.player;
            clone.addEventListener('dragstart', handleDragStart);
            clone.addEventListener('dragend', handleDragEnd);
            cell.appendChild(clone);
            troopPositions[`${row}-${col}`] = clone.id;
            updateTroopTable(getPlayerLabel(player), name, `${row}-${col}`);
        }
        return;
    }

    // Enlève l'ancienne troop
    const oldCell = document.querySelector(`.grid-cell[data-row="${fromPos.split('-')[0]}"][data-col="${fromPos.split('-')[1]}"]`);
    if (oldCell && oldCell.firstChild && oldCell.firstChild.id === troopId) {
        oldCell.removeChild(oldCell.firstChild);
        delete troopPositions[fromPos];
    }

    // Ajouter la troupe dans la nouvelle case
    cell.appendChild(troop);
    troop.addEventListener('dragend', handleDragEnd);
    troopPositions[`${row}-${col}`] = troopId;
    updateTroopTable(getPlayerLabel(player), troop.textContent, `${row}-${col}`);
}

//remove a troop if dropped outside any grid cell
function handleDragEnd(e) {
    const fromPos = e.dataTransfer.getData('from-cell');
    if (fromPos && e.dataTransfer.dropEffect === 'none') {
        const [row, col] = fromPos.split('-');
        const cell = document.querySelector(
            `.grid-cell[data-row="${row}"][data-col="${col}"]`
        );
        const troop = document.getElementById(e.target.id);
        if (cell && troop && cell.firstChild === troop) {
            cell.removeChild(troop);
            delete troopPositions[fromPos];
            
            const player = cell.dataset.allowedPlayer;
            const name = troop.dataset.name;
            const cntObj = getTroopCounts(player).find(o => o[name] !== undefined);
            if (cntObj) {
                cntObj[name]++;
                initTroopList(player, selectedFactions[player]);
            }
        }
    }
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
// Statistiques des troupes (reprend les infos de page3.js)
const unitStats = {
    Legionnaire: {
        name: 'Legionnaire',
        type: 'Infanterie légère',
        description: "Unité de base de l'armée romaine, armée d'un glaive et d'un bouclier.",
        health: 10, morale: 5, attack: 5, defense: 1, portee: 1, vitesse: 1
    },
    Archer: {
        name: 'Archer',
        type: 'Infanterie longue distance',
        description: "Tir à distance avec des flèches, mais vulnérable au corps à corps.",
        health: 7, morale: 10, attack: 3, defense: 2, portee: 4, vitesse: 1
    },
    Cavalier: {
        name: 'Cavalier',
        type: 'Cavalerie lourde',
        description: "Unité de cavalerie lourde, armée d'une lance et d'un bouclier.",
        health: 13, morale: 10, attack: 5, defense: 2, portee: 1, vitesse: 2
    },
    Elephants: {
        name: 'Eléphants de guerre',
        type: "Unité d’impact psychologique",
        description: "Effraie particulièrement les chevaux. -1 moral à tous les ennemis à pied et -2 pour ceux à cheval.",
        health: 15, morale: 5, attack: 4, defense: 0, portee: 1, vitesse: 1
    },
    Lancier: {
        name: 'Lancier',
        type: 'Infanterie légère',
        description: "Infanterie courageuse et susceptible de charges furieuses.",
        health: 9, morale: 10, attack: 4, defense: 0, portee: 2, vitesse: 1
    },
    Frondeur: {
        name: 'Frondeur',
        type: 'Infanterie légère',
        description: "Tireur d'élite armé d'une fronde, capable de tirer à distance.",
        health: 6, morale: 5, attack: 6, defense: 1, portee: 3, vitesse: 1
    }
};



const infoPanel = document.getElementById('troop-info-panel');

document.addEventListener('mouseover', function (e) {
    let name = null;
    let player = null;
    if (e.target.classList.contains('troop-item')) {
        name = e.target.dataset.name || e.target.dataset.trooptype;
        player = e.target.dataset.player;
    }
    if (name && unitStats[name]) {
        const stats = unitStats[name];
        infoPanel.innerHTML = `
            <strong>${stats.name}</strong><br>
            <em>${stats.type}</em><br>
            <span style="font-size:13px;">${stats.description}</span>
            <hr>
            <b>PV</b>: ${stats.health} &nbsp; <b>Morale</b>: ${stats.morale}<br>
            <b>Attaque</b>: ${stats.attack} &nbsp; <b>Défense</b>: ${stats.defense}<br>
            <b>Portée</b>: ${stats.portee} &nbsp; <b>Vitesse</b>: ${stats.vitesse}
        `;
        infoPanel.style.display = 'block';
        // Affiche à gauche pour équipe 1, à droite pour équipe 2
        if (player === 'player1') {
            infoPanel.style.left = '40px';
            infoPanel.style.right = '';
        } else {
            infoPanel.style.right = '40px';
            infoPanel.style.left = '';
        }
    }
});
// ------------------ RUN ------------------

initialisation()