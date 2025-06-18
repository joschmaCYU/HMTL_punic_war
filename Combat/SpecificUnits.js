// Définition des types d'unités pour Rome
const unitTypes = {
    Legionnaire: {
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
        name: 'Lancier',
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
    elephants: {
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
function createUnit(unitKey, side = 'rome') {
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

// Exemple de création d'une armée
function createArmy(unitKeys, side = 'rome') {
    return unitKeys.map(key => createUnit(key, side));
}

// Exemple d'utilisation pour Rome :
const romeArmy = createArmy(['hastati', 'princeps', 'triarii', 'equites'], 'rome');
console.log('Armée de Rome:', romeArmy);

// Exemple d'utilisation pour Carthage :
const carthageArmy = createArmy(['ibere', 'gauloise', 'libyen', 'numides', 'elephants'], 'carthage');
console.log('Armée de Carthage:', carthageArmy);