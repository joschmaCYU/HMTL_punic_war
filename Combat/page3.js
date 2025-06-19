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
        health: 10,
        morale: 10,
        attack: 3,
        defense: 2,
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
        health: 10,
        morale: 10,
        attack: 5, // Vous pouvez ajouter +1 lors d'une attaque spécifique si nécessaire
        defense: 2,
        camp: 0,
        portee: 1,
        vitesse: 2,
    },
};

// Définition des types d'unités pour Carthage
const carthageUnitTypes = {
    Lancier: {
        name: 'Lancier',
        posrow: 0,
        poscol: 0,
        type: 'infanterie légère',
        description: "Une infanterie courageuse et susceptible de charges furieuses.",
        health: 10,
        morale: 10,
        attack: 4,
        defense: 0,
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
        health: 10,
        morale: 5,
        attack: 6,
        defense: 1,
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
    // if (closestEnemy != null) {
    //     // console.log(`${unite.name} en ${unite.posrow},${unite.poscol} cible ${ennemiLePlusProche.name} en ${ennemiLePlusProche.posrow},${ennemiLePlusProche.poscol}`);
    // }
    return closestEnemy;
}

function computeDistance(unite, ennemi) {
    const deltaRow = unite.posrow - ennemi.posrow;
    const deltaCol = unite.poscol - ennemi.poscol;
    return Math.floor(Math.hypot(deltaRow, deltaCol));
}

async function move(unite, ennemi, Armee1, Armee2) {
    const maxSteps = unite.vitesse;
    console.log("la troupe", unite.name, "en", unite.posrow, unite.poscol);

    for (let step = 0; step < maxSteps; step++) {
        const currDist = computeDistance(unite, ennemi);
        const deltas = [
            { dr:  1, dc:  0 },
            { dr: -1, dc:  0 },
            { dr:  0, dc:  1 },
            { dr:  0, dc: -1 }
        ];
        // moves qui rapprochent
        const candidates = deltas
            .map(d => ({ row: unite.posrow + d.dr, col: unite.poscol + d.dc,
                         dist: Math.hypot((unite.posrow + d.dr) - ennemi.posrow,
                                          (unite.poscol + d.dc) - ennemi.poscol)}))
            .filter(m => m.dist < currDist 
                     && ![...Armee1, ...Armee2].some(u => u !== unite && u.posrow===m.row && u.poscol===m.col));
        if (candidates.length === 0) {
            // contournement basique : voisin libre quelconque
            const frees = deltas
                .map(d => ({ row: unite.posrow + d.dr, col: unite.poscol + d.dc }))
                .filter(m => ![...Armee1, ...Armee2].some(u => u.posrow===m.row && u.poscol===m.col));
            if (frees.length > 0) {
                const alt = frees[0];
                unite.posrow = alt.row;
                unite.poscol = alt.col;
                console.log(`${unite.name} contourne obstacle vers`, alt.row, alt.col);
                unite.blockCount = 0;
                continue;
            }
            
            // pas de voisin libre
            unite.blockCount = (unite.blockCount||0) + 1;
            if (unite.blockCount >= 5) {
                unite.blockCount = 0;
                console.log(`${unite.name} reste bloquée après 5 tentatives, mouvement annulé`);
                return;  // on abandonne ce tour de déplacement
            }
            console.log("is blocked");
            return;
        }
        
        // déplaçer vers la première case
        const mv = candidates[0];
        unite.posrow = mv.row;  unite.poscol = mv.col;
        console.log("se déplace en", mv.row, mv.col);
        unite.blockCount = 0;
    }
    return animateMoveTo(unite);
}

function attack(unite, ennemi, armee1, armee2) {
    // puissance moins résistance
    let degat = Math.max(unite.attack - ennemi.defense, 0);
    // bonus des éléphants de guerre (+1 puissance vs cavalerie)
    if (unite.name === 'Eléphants de guerre' && ennemi.name === 'Cavalier') {
        degat += 1;
    }

    animateAttack(unite, ennemi);

    if (ennemi.morale <= 3 && unite.morale >= 5) {
        degat += 2;
    }
    ennemi.health -= degat;

    console.log(unite.name, 'attaque', ennemi.name, "qui se retrouve avec", ennemi.health, 'pv');
    
    if (ennemi.health <= 0) {
        isDead(ennemi, armee1, armee2);
    }
}

function animateAttack(unite, ennemi) {
    if (unite.name === 'Archer' || unite.name === 'Frondeur') {
        const battlefield = document.getElementById('battlefield');
        const arrowImg = document.createElement('img');
        if (unite.name === 'Archer') {
            arrowImg.src = '../image/arrow.png';
        } else {
            arrowImg.src = '../image/stone.png';
        }
        arrowImg.style.position = 'absolute';
        arrowImg.style.width = '60px';
        arrowImg.style.height = '20px';
        arrowImg.style.zIndex = '1000';
        arrowImg.style.transformOrigin = 'center center';
        arrowImg.style.transition = 'left 0.3s linear, top 0.3s linear';
        arrowImg.style.left = unite.div.style.left;
        arrowImg.style.top  = unite.div.style.top;
        battlefield.appendChild(arrowImg);

        const startX = parseFloat(arrowImg.style.left);
        const startY = parseFloat(arrowImg.style.top);
        const targetX = parseFloat(ennemi.div.style.left);
        const targetY = parseFloat(ennemi.div.style.top);
        const angleDeg = Math.atan2(targetY - startY, targetX - startX) * 180 / Math.PI;
        arrowImg.style.transform = `rotate(${angleDeg}deg)`;
        
        void arrowImg.offsetWidth;
        arrowImg.style.left = ennemi.div.style.left;
        arrowImg.style.top  = ennemi.div.style.top;
        arrowImg.addEventListener('transitionend', () => arrowImg.remove());
    } else if (unite.name === 'Legionnaire') {
        const battlefield = document.getElementById('battlefield');
        const sword = document.createElement('img');

        sword.src = '../image/sword_rome.png';
        sword.style.position = 'absolute';
        sword.style.width = '40px';
        sword.style.height = '80px';
        sword.style.zIndex = '1000';
        sword.style.transformOrigin = '50% 0%';

        // compute centers
        const ux = parseFloat(unite.div.style.left);
        const uy = parseFloat(unite.div.style.top);
        const cell = 80, halfCell = cell/2;
        const centerX = ux + halfCell;
        const centerY = uy + halfCell;

        // compute unit→enemy direction
        const tx = parseFloat(ennemi.div.style.left);
        const ty = parseFloat(ennemi.div.style.top);
        const dx = tx - centerX, dy = ty - centerY;
        const dist = Math.hypot(dx, dy) || 1;
        const nx = dx/dist, ny = dy/dist;

        // offset sword center to unit edge toward enemy
        const swordW = 60, swordH = 60;
        const edgeDist = halfCell;   // place at unit border
        const sx = centerX + nx*edgeDist  - swordW/2;
        const sy = centerY + ny*edgeDist  - swordH/2;
        sword.style.left = `${sx}px`;
        sword.style.top  = `${sy + 50}px`;

        battlefield.appendChild(sword);

        // compute swing angles
        const baseAngle = Math.atan2(dy, dx)*180/Math.PI - 90;
        const swing = 60, fromA = baseAngle - swing/2, toA = baseAngle + swing/2;
        sword.style.transform = `rotate(${fromA}deg)`;
        void sword.offsetWidth;
        sword.style.transition = 'transform 0.3s ease-in-out';
        sword.style.transform = `rotate(${toA}deg)`;

        sword.addEventListener('transitionend', () => {
            if (sword.parentNode) battlefield.removeChild(sword);
        }, { once: true });

    } else if (unite.name === 'Lancier') {
        const battlefield = document.getElementById('battlefield');
        
        const lance = document.createElement('img');
        lance.src = '../image/Lance.png';
        lance.style.position = 'absolute';
        lance.style.width = '80px';
        lance.style.height = '40px';
        lance.style.zIndex = '1000';
        lance.style.transformOrigin = '50% 50%';

        // start position
        const startX = parseFloat(unite.div.style.left);
        const startY = parseFloat(unite.div.style.top);
        lance.style.left = `${startX}px`;
        lance.style.top  = `${startY}px`;

        // compute target position
        const targetX = parseFloat(ennemi.div.style.left);
        const targetY = parseFloat(ennemi.div.style.top);

        // rotate toward enemy
        const angle = Math.atan2(targetY - startY, targetX - startX) * 180 / Math.PI;
        lance.style.transform = `rotate(${angle}deg)`;

        // set up transition
        lance.style.transition = 'left 0.3s linear, top 0.3s linear';
        battlefield.appendChild(lance);

        let returned = false;
        lance.addEventListener('transitionend', function handler() {
            if (!returned) {
                returned = true;
                // reverse back to start
                lance.style.left = `${startX}px`;
                lance.style.top  = `${startY}px`;
            } else {
                // cleanup
                battlefield.removeChild(lance);
                lance.removeEventListener('transitionend', handler);
            }
        });

        // trigger move forward
        void lance.offsetWidth;
        lance.style.left = `${targetX}px`;
        lance.style.top  = `${targetY}px`;
    } else {
        const battlefield = document.getElementById('battlefield');
        const cloud = document.createElement('img');
        cloud.src = '../image/Dust_Sticker.gif'
        cloud.style.position = 'absolute'
        cloud.style.width  = '200px'
        cloud.style.height = '80px'
        cloud.style.zIndex = '1000'
        cloud.style.transformOrigin = 'center center';

        // calculate direction toward enemy
        const startX = parseFloat(unite.div.style.left);
        const startY = parseFloat(unite.div.style.top);
        const targetX = parseFloat(ennemi.div.style.left);
        const targetY = parseFloat(ennemi.div.style.top);
        const angleDeg = Math.atan2(targetY - startY, targetX - startX) * 180 / Math.PI;
        cloud.style.transform = `rotate(${angleDeg}deg)`;

        // calculer le point médian entre attaquant et défenseur
        const ax = parseFloat(unite.div.style.left)
        const ay = parseFloat(unite.div.style.top)
        const bx = parseFloat(ennemi.div.style.left)
        const by = parseFloat(ennemi.div.style.top)
        const mx = (ax + bx) / 2 - 60  // centrer le GIF (80/2)
        const my = (ay + by) / 2

        cloud.style.left = `${mx}px`
        cloud.style.top  = `${my}px`

        battlefield.appendChild(cloud)

        // supprimer le nuage après la courte animation
        setTimeout(() => {
            if (cloud.parentNode) battlefield.removeChild(cloud)
        }, 500)
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// wrap in a Promise so we can wait for the action
function animateMoveTo(troop) {
    return new Promise(resolve => {
        const speed = 1.3;
        const cellWidth  = 80;
        const cellHeight = 80;

        function step() {
            const currentLeft = parseFloat(troop.div.style.left);
            const currentTop = parseFloat(troop.div.style.top);

            // compute pixel target from grid coords
            const targetLeft = troop.poscol * cellWidth;
            const targetTop  = troop.posrow * cellHeight;

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
                resolve();
            }
        }
        step();
    });
}

async function action(unite, Armee1, Armee2) {
    let ArmeeEnnemi;
    if (unite.camp == 1) ArmeeEnnemi = Armee2;
    if (unite.camp == 2) ArmeeEnnemi = Armee1;
    if (!ArmeeEnnemi.length) return;
    const cible = closestEnemi(unite, ArmeeEnnemi);
    if (computeDistance(unite, cible) <= unite.portee) {
        attack(unite, cible, Armee1, Armee2);
        await sleep(500);    // pause de 500 ms après l’attaque
    } else {
        await move(unite, cible, Armee1, Armee2);
    }
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
    container.style.height = '90vh';
    container.id = 'battlefield';
    document.body.appendChild(container);

    const cellWidth = 80;
    const cellHeight = 80;

    const troops = [];
    const posArmee1 = [];
    const posArmee2 = [];

    var armee1 = [];
    var armee2 = [];

    placement.split(',').forEach(entry => {
        const [player, pos, id] = entry.split(':');
        const [row, col] = pos.split('-').map(Number);

        const name = idToName[parseInt(id, 10)];
        if (!name) return;

        const left = col * cellWidth;
        const top  = row * cellHeight;

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
        
        // assombrir l’image pour le joueur 2
        const params = new URLSearchParams(window.location.search);
        const p1 = params.get('player1Faction');
        const p2 = params.get('player2Faction');
        if (player === '2' && p1 == p2) {
            img.style.filter = 'saturate(130%)';
        }

        troopDiv.appendChild(img);

        container.appendChild(troopDiv);

        troops.push({ player: parseInt(player, 10), div: troopDiv });
        const nom = idToName[parseInt(id, 10)];
        if (player == '1') {
            posArmee1.push([row, col]);
            if (['1', '2', '3'].includes(id)) {
                let unit = createUnit(nom, side = 'rome', col, row, camp = 1);
                unit.div = troopDiv;
                unit.blockCount = 0;

                armee1.push(unit);
            }

            if (['4', '5', '6'].includes(id)) {
                let unit = createUnit(nom, side = 'carthage', col, row, camp = 1);
                unit.div = troopDiv;
                unit.blockCount = 0;

                armee1.push(unit);
            }
        }
        if (player == '2') {
            posArmee2.push([row, col]);
            if (['1', '2', '3'].includes(id)) {
                let unit = createUnit(nom, side = 'rome', col, row, camp = 2);
                unit.div = troopDiv;
                unit.blockCount = 0;

                armee2.push(unit);
            }
            if (['4', '5', '6'].includes(id)) {
                let unit = createUnit(nom, 'carthage', col, row, 2);
                unit.div = troopDiv;
                unit.blockCount = 0;

                armee2.push(unit);
            }
        }

    });
    console.log('Armee1 :', JSON.parse(JSON.stringify(armee1)));
    console.log('Armee2 :', JSON.parse(JSON.stringify(armee2)));

    // effet « peur » des éléphants
    function applyElephantFear(army, enemies) {
        army.filter(u => u.name === 'Eléphants de guerre')
            .forEach(() => {
                enemies.forEach(e => {
                    const delta = e.vitesse > 1 ? -2 : -1;
                    e.morale = Math.max(e.morale + delta, 0);
                    // ensure we remember the unit’s starting morale
                    if (e.initialMorale === undefined) {
                        e.initialMorale = e.morale - delta;
                    }
                    // compute normalized value between 0 and 1
                    const normalizedMorale = e.initialMorale > 0
                        ? e.morale / e.initialMorale
                        : 0;
                    // apply it visually (e.g. fade out low-morale troops)
                    if (e.div) {
                        // baisse la saturation en fonction du moral (1 = pleine couleur, 0 = désaturé)
                        e.div.style.filter = `saturate(${normalizedMorale})`;
                    }
                });
            });
    }

    // retire (fuite) les unités dont le moral est à 0 ou moins (il suffit de spam les élé et si on limite les élé ça n'a aucun interet)
    function applyRouting(army) {
        for (let i = army.length - 1; i >= 0; i--) {
            const u = army[i];
            if (u.morale <= 0) {
                if (u.div) u.div.style.display = 'none';
                console.log(`${u.name} de l'armée ${u.camp} fuit le combat !`);
                army.splice(i, 1);
            }
        }
    }

    applyElephantFear(armee1, armee2);
    applyElephantFear(armee2, armee1);
    console.log('Morale après effet de peur – Armée 1 :', 
        armee1.map(u => `${u.name}: ${u.morale}`));
    console.log('Morale après effet de peur – Armée 2 :', 
        armee2.map(u => `${u.name}: ${u.morale}`));

    applyRouting(armee1);
    applyRouting(armee2);

    // battle simulation with delay between actions
    async function runBattle() {
        while (armee1.length && armee2.length) {
            const first = Math.random();
            const maxLen = Math.max(armee1.length, armee2.length);
            for (let i = 0; i < maxLen; i++) {
                if (first <= 0.5) {
                    if (i < armee1.length) await action(armee1[i], armee1, armee2);
                    if (i < armee2.length) await action(armee2[i], armee1, armee2);
                } else {
                    if (i < armee2.length) await action(armee2[i], armee1, armee2);
                    if (i < armee1.length) await action(armee1[i], armee1, armee2);
                }
                if (!armee1.length || !armee2.length) break;
            }
        }
        showWinScreen(armee1.length ? 'armée 1' : 'armée 2');
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

// ajout : écran de victoire
function showWinScreen(winner) {
    var changeaudio = document.querySelector('audio');
    changeaudio.src = "../musique/VICTOIRE1.mp3";
    changeaudio.loop = false;
    audio.load(); 
    audio.play();
    
    const overlay = document.createElement('div');
    overlay.id = 'win-screen';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.8)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.color = '#fff';
    overlay.style.fontSize = '2rem';
    overlay.innerHTML = `
        <div class="victory">Victoire de ${winner} !</div>
        <button class="btn" id="restart-btn" style="margin:20px;padding:10px 20px;font-size:1rem;">Rejouer</button>
        <button class="btn" id="placement-btn" style="margin:20px;padding:10px 20px;font-size:1rem;">Retour Placement</button>
    `;
    document.body.appendChild(overlay);
    document.getElementById('restart-btn').onclick = () => location.reload();
    document.getElementById('placement-btn').onclick = goToPreviousPage;
}
