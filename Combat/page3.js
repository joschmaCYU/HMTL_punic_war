
const unitTypes = {
    Légionnaire: {
        name: 'Légionnaire',
        type: 'infanterie légère',
        description: "Unité de base de l armée romaine, armée d un glaive et d un bouclier.",
        health: 10,
        morale: 5,
        attack: 4,
        defense: 1,
        line: 1,
    },
    Archer: {
        name: 'Archer',
        type: 'infanterie longue distance',
        description: "tir à distance avec des flèches, mais vulnérable au corps à corps.",
        health: 10,
        morale: 10,
        attack: 4,
        defense: 2,
        line: 3,
    },
    Cavalier: {
        name: 'Cavalier',
        type: 'cavalerie lourde',
        description: "Unité de cavalerie lourde, armée d une lance et d un bouclier.",
        health: 10,
        morale: 10,
        attack: 4, // Vous pouvez ajouter +1 lors d'une attaque spécifique si nécessaire
        defense: 2,
        line: 2,
    },
};

// Définition des types d'unités pour Carthage
const carthageUnitTypes = {

    Lancier: {
        name: 'Infanterie Gauloise',
        type: 'infanterie légère',
        description: "Une infanterie courageuse et susceptible de charges furieuses.",
        health: 10,
        morale: 10,
        attack: 4,
        defense: 0,
        line: 1,
    },
    Frondeur: {
        name: 'Frondeur',
        type: 'infanterie légère',
        description: "Tireur d élite armé d une fronde, capable de tirer à distance.",
        health: 10,
        morale: 5,
        attack: 3,
        defense: 1,
        line: 1,
    },
    Elephants: {
        name: 'Eléphants de guerre',
        type: 'unité d’impact psychologique',
        description: "Une arme essentiellement psychologique, qui effraie particulièrement les chevaux. Au début d’une bataille : -1 moral à tous les ennemis à pied et -2 pour ceux à cheval.",
        health: 10,
        morale: 5,
        attack: 5,
        defense: 0,
        line: 3,
    },
};

// Fonction pour créer une unité en clonant le modèle de base
function createUnit(unitKey, side) {
    let baseUnit;
    if (side === 'rome') {
        baseUnit = unitTypes[unitKey];
    } else if (side === 'carthage') {
        baseUnit = carthageUnitTypes[unitKey];
    }
    if (!baseUnit) {
        throw new Error(`Type d'unité inconnu: ${unitKey} pour ${side}`);
    }
    // Utilisation de structuredClone pour éviter une simple référence
    return structuredClone(baseUnit);
}

window.onload = function() {
    const params = new URLSearchParams(window.location.search);
    const placement = params.get('troop_placement');
    if (!placement) return;

    const idToName = {
        1: 'Légionnaire',
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

        troops.push({player: parseInt(player, 10), div: troopDiv});
        const nom = idToName[parseInt(id, 10)];
        if (player == '1') {

            if (['1', '2', '3'].includes(id)) {
                
                Armee1.push(createUnit(nom,side = 'rome'));
            }
            
            if (['4', '5', '6'].includes(id)) {

                Armee1.push(createUnit(nom,side = 'carthage'));
            }
        }
        if (player == '2') {
            if (['1', '2', '3'].includes(id)) {

                Armee1.push(createUnit(nom,side = 'rome'));
            }
            if (['4', '5', '6'].includes(id)) {

                Armee2.push(createUnit(nom,side = 'carthage'));
            }
        }
        
    });
    console.log(Armee1)
    // Animation
    const speed = 1; // pixels par frame

    function animate() {
        let movement = false;
        troops.forEach(troop => {
            const currentLeft = parseFloat(troop.div.style.left);
            if (troop.player === 1 && currentLeft + cellWidth < 500) {
                troop.div.style.left = `${currentLeft + speed}px`;
                movement = true;
            } else if (troop.player === 2 && currentLeft > 500) {
                troop.div.style.left = `${currentLeft - speed}px`;
                movement = true;
            }
        });

        if (movement) {
            requestAnimationFrame(animate);
        }
    }

    animate();
}
