const unitTypes = {
    Legionnaire: {
        name: 'Legionnaire',
        posrow: 0,
        poscol: 0,
        type: 'infanterie légère',
        description: "Unité de base de l armée romaine, armée d un glaive et d un bouclier.",
        health: 10,
        morale: 5,
        attack: 4,
        defense: 1,
        line: 1,
        camp: 0,
        portee: 1,
        vitesse: 1,
    },
    Archer: {
        name: 'Archer',
        posrow: 0,
        poscol: 0,
        type: 'infanterie longue distance',
        description: "tir à distance avec des flèches, mais vulnérable au corps à corps.",
        health: 7,
        morale: 10,
        attack: 3,
        defense: 2,
        line: 3,
        camp: 0,
        portee: 3,
        vitesse: 1,
    },
    Cavalier: {
        name: 'Cavalier',
        posrow: 0,
        poscol: 0,
        type: 'cavalerie lourde',
        description: "Unité de cavalerie lourde, armée d une lance et d un bouclier.",
        health: 12,
        morale: 10,
        attack: 5, // Vous pouvez ajouter +1 lors d'une attaque spécifique si nécessaire
        defense: 2,
        line: 2,
        camp: 0,
        portee: 1,
        vitesse: 2,
    },
};

// Définition des types d'unités pour Carthage
const carthageUnitTypes = {

    Lancier: {
        name: 'Infanterie Gauloise',
        posrow: 0,
        poscol: 0,
        type: 'infanterie légère',
        description: "Une infanterie courageuse et susceptible de charges furieuses.",
        health: 9,
        morale: 10,
        attack: 4,
        defense: 0,
        line: 1,
        camp: 0,
        portee: 2,
        vitesse: 1,
    },
    Frondeur: {
        name: 'Frondeur',
        posrow: 0,
        poscol: 0,
        type: 'infanterie légère',
        description: "Tireur d élite armé d une fronde, capable de tirer à distance.",
        health: 6,
        morale: 5,
        attack: 6,
        defense: 1,
        line: 1,
        camp: 0,
        portee: 2,
        vitesse: 1,
    },
    Elephants: {
        name: 'Eléphants de guerre',
        posrow: 0,
        poscol: 0,
        type: 'unité d’impact psychologique',
        description: "Une arme essentiellement psychologique, qui effraie particulièrement les chevaux. Au début d’une bataille : -1 moral à tous les ennemis à pied et -2 pour ceux à cheval.",
        health: 15,
        morale: 5,
        attack: 4,
        defense: 0,
        line: 3,
        camp: 0,
        portee: 1,
        vitesse: 1,
    },
};

// Fonction pour créer une unité en clonant le modèle de base
function createUnit(unitKey, side, poscol, posrow, camp) {
    let baseUnit;
    if (side === 'rome') {
        baseUnit = unitTypes[unitKey];
    } else if (side === 'carthage') {
        baseUnit = carthageUnitTypes[unitKey];
    }
    if (!baseUnit) {
        throw new Error(`Type d'unité inconnu: ${unitKey} pour ${side}`);
    }
    baseUnit.poscol = poscol;
    baseUnit.posrow = posrow;
    baseUnit.camp = camp;
    // Utilisation de structuredClone pour éviter une simple référence
    return structuredClone(baseUnit);
}

function closestEnemi(unite, ArmeeEnnemi) {
    let closestEnemy = null;
    let minDistance = Infinity;

    ArmeeEnnemi.forEach(ennemi => {
        const deltaRow = ennemi.posrow - unite.posrow;
        const deltaCol = ennemi.poscol - unite.poscol;
        const distance = Math.hypot(deltaRow, deltaCol);

        if (distance < minDistance) {
            minDistance = distance;
            closestEnemy = ennemi;
        }
    });
    if (closestEnemy != null) {
        // console.log(`${unite.name} en ${unite.posrow},${unite.poscol} cible ${ennemiLePlusProche.name} en ${ennemiLePlusProche.posrow},${ennemiLePlusProche.poscol}`);
    }
    return closestEnemy;
}


function computeDistance(unite, ennemi) {
    const deltaRow = unite.posrow - ennemi.posrow;
    const deltaCol = unite.poscol - ennemi.poscol;
    return Math.floor(Math.hypot(deltaRow, deltaCol));
}

function move(unite, ennemi, Armee1, Armee2) {
    const maxSteps = unite.vitesse;
    console.log("la troupe", unite.name, "en", unite.posrow, unite.poscol);

    for (let step = 0; step < maxSteps; step++) {
        const currDist = computeDistance(unite, ennemi);
        // try all four directions
        const deltas = [
            { dr:  1, dc:  0 },
            { dr: -1, dc:  0 },
            { dr:  0, dc:  1 },
            { dr:  0, dc: -1 }
        ];
        // collect moves that reduce distance and are not occupied
        const candidates = deltas
            .map(d => ({
                row: unite.posrow + d.dr,
                col: unite.poscol + d.dc,
                dist: Math.hypot((unite.posrow + d.dr) - ennemi.posrow,
                                 (unite.poscol + d.dc) - ennemi.poscol)
            }))
            .filter(m =>
                m.dist < currDist &&
                ![...Armee1, ...Armee2].some(u => u !== unite && u.posrow === m.row && u.poscol === m.col)
            );
        if (candidates.length === 0) {
            // no better free cell: stop trying further
            console.log("is blocked");
            return;
        }
        // pick first (or randomize: candidates[Math.floor(Math.random()*candidates.length)])
        const move = candidates[0];
        unite.posrow = move.row;
        unite.poscol = move.col;
        console.log("se déplace en", unite.posrow, unite.poscol);
    }
    animate_move_to(unite);
}

function attack(unite, ennemi, Armee1, Armee2) {
    let degat = unite.attack;

    if (ennemi.morale <= 3 && unite.morale >= 5) {
        degat += 2;
    }
    ennemi.health -= degat;

    console.log(unite.name, 'attaque', ennemi.name, "qui se retrouve avec", ennemi.health, 'pv');
    
    if (ennemi.health <= 0) {
        isDead(ennemi, Armee1, Armee2);
    }
}

function isDead(unite, Armee1, Armee2) {
    if (unite.div) {
        unite.div.style.display = 'none';
    }

    if (unite.camp == 1) {
        const index = Armee1.indexOf(unite);
        if (index !== -1) {
            Armee1.splice(index, 1);
        }
        console.log('la troupe', unite.name, 'de larmée 1 est morte au combat !')
    }

    if (unite.camp == 2) {
        const index = Armee2.indexOf(unite);
        if (index !== -1) {
            Armee2.splice(index, 1);
        }
        console.log('la troupe', unite.name, 'de larmée 2 est morte au combat !')
    }
}

function action(unite, Armee1, Armee2) {
    if (unite.camp == 1) {
        ArmeeEnnemi = Armee2;
    }
    if (unite.camp == 2) {
        ArmeeEnnemi = Armee1;
    }
    if (ArmeeEnnemi.length !== 0) {
        cible = closestEnemi(unite, ArmeeEnnemi);
        if (computeDistance(unite, cible) <= unite.portee) {
            attack(unite, cible, Armee1, Armee2);
            // TODO afficher un GIF après l'attaque
        } else {
            move(unite, cible, Armee1, Armee2);
        }
    }
}

function animate_move_to(troop) {
    const speed = 1;
    const cellWidth = 80, cellHeight = 80, gap = 200;
    function step() {
        const currentLeft = parseFloat(troop.div.style.left);
        const currentTop = parseFloat(troop.div.style.top);

        // compute pixel target from grid coords
        const targetLeft = troop.poscol <= 4
            ? troop.poscol * cellWidth
            : (troop.poscol - 5) * cellWidth + 5 * cellWidth + gap;
        const targetTop = troop.posrow * cellHeight;

        const deltaX = targetLeft - currentLeft;
        const deltaY = targetTop - currentTop;
        const distance = Math.hypot(deltaX, deltaY);

        if (distance > speed) {
            troop.div.style.left = `${currentLeft + (deltaX / distance) * speed}px`;
            troop.div.style.top = `${currentTop + (deltaY / distance) * speed}px`;
            requestAnimationFrame(step);
        } else {
            troop.div.style.left = `${targetLeft}px`;
            troop.div.style.top = `${targetTop}px`;
        }
    }
    step();
}

window.onload = function () {
    const params = new URLSearchParams(window.location.search);
    const placement = params.get('troop_placement');
    if (!placement) return;

    const idToName = {
        1: 'Legionnaire',
        2: 'Archer',
        3: 'Cavalier',
        4: 'Elephants',
        5: 'Lancier',
        6: 'Frondeur'
    };

    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = '1000px';
    container.style.height = '800px';
    container.style.background = '#f4f4f4';
    container.id = 'battlefield';
    container.style.margin = '40px auto';
    container.style.display = 'block';
    container.style.border = '2px solid #999';
    document.body.appendChild(container);

    const cellWidth = 80;
    const cellHeight = 80;
    const gap = 200;

    const troops = [];
    const posArmee1 = [];
    const posArmee2 = [];


    var Armee1 = [];
    var Armee2 = [];

    placement.split(',').forEach(entry => {

        const [player, pos, id] = entry.split(':');
        const [row, col] = pos.split('-').map(Number);

        const name = idToName[parseInt(id, 10)];
        if (!name) return;

        let left;
        if (col <= 4) {
            left = col * cellWidth;
        } else if (col >= 5 && col <= 9) {
            left = (col - 5) * cellWidth + 5 * cellWidth + gap;
        } else {
            left = 0;
        }
        const top = row * cellHeight;

        const troopDiv = document.createElement('div');
        troopDiv.className = 'troop';
        troopDiv.style.position = 'absolute';
        troopDiv.style.left = `${left}px`;
        troopDiv.style.top = `${top}px`;
        troopDiv.style.width = `${cellWidth}px`;
        troopDiv.style.height = `${cellHeight}px`;
        troopDiv.style.zIndex = 2;

        const img = document.createElement('img');
        img.src = `../image/${name}.png`;
        img.alt = name;
        img.style.width = '100%';
        img.style.height = '100%';
        troopDiv.appendChild(img);

        container.appendChild(troopDiv);

        troops.push({ player: parseInt(player, 10), div: troopDiv });
        const nom = idToName[parseInt(id, 10)];
        if (player == '1') {
            posArmee1.push([row, col]);
            if (['1', '2', '3'].includes(id)) {
                let unit = createUnit(nom, side = 'rome', col, row, camp = 1);
                unit.div = troopDiv;

                Armee1.push(unit);
            }

            if (['4', '5', '6'].includes(id)) {
                let unit = createUnit(nom, side = 'carthage', col, row, camp = 1);
                unit.div = troopDiv;

                Armee1.push(unit);
            }
        }
        if (player == '2') {
            posArmee2.push([row, col]);
            if (['1', '2', '3'].includes(id)) {
                let unit = createUnit(nom, side = 'rome', col, row, camp = 2);
                unit.div = troopDiv;

                Armee2.push(unit);
            }
            if (['4', '5', '6'].includes(id)) {
                let unit = createUnit(nom, 'carthage', col, row, 2);
                unit.div = troopDiv;
                Armee2.push(unit);
            }
        }

    });
    console.log('Armee1', Armee1);
    console.log('Armee2', Armee2);

    // battle simulation with delay between actions
    async function runBattle() {
        const delayMs = 500;
        while (Armee1.length && Armee2.length) {
            const first = Math.random();
            const maxLen = Math.max(Armee1.length, Armee2.length);
            for (let i = 0; i < maxLen; i++) {
                if (first <= 0.5) {
                    if (i < Armee1.length) action(Armee1[i], Armee1, Armee2);
                    if (i < Armee2.length) action(Armee2[i], Armee1, Armee2);
                } else {
                    if (i < Armee2.length) action(Armee2[i], Armee1, Armee2);
                    if (i < Armee1.length) action(Armee1[i], Armee1, Armee2);
                }
                await sleep(delayMs);
                if (!Armee1.length || !Armee2.length) break;
            }
        }
        console.log(Armee1.length
            ? "Victoire de l'armée 1"
            : "Victoire de l'armée 2"
        );
    }

    // helper for delaying execution
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    runBattle();
};

// Ajouter la fonction "page précédente"
function goToPreviousPage() {
    const params = new URLSearchParams(window.location.search);
    const p1 = params.get('player1Faction');
    const p2 = params.get('player2Faction');
    window.location.href = `../Troop_Placement/page2.html?player1Faction=${p1}&player2Faction=${p2}`;
}
