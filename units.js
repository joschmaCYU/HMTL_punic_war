// Définition des types d'unités pour Rome
const unitTypes = {
    hastati: {
        name: 'Hastati',
        type: 'infanterie légère',
        description: "Soldats inexpérimentés et moyennement équipés, placés en première ligne pour améliorer leurs aptitudes.",
        health: 10,
        morale: 5,
        attack: 4,
        defense: 1,
        line: 1,
    },
    princeps: {
        name: 'Princeps',
        type: 'infanterie lourde',
        description: "Infanterie lourde assez coûteuse à équiper mais résistante, historiquement placée derrière les Hastati.",
        health: 10,
        morale: 10,
        attack: 4,
        defense: 2,
        line: 2,
    },
    triarii: {
        name: 'Triarii',
        type: 'infanterie lourde',
        description: "Infanterie lourde de vétérans, munie de longues lances contre la cavalerie (+1 puissance).",
        health: 10,
        morale: 10,
        attack: 4, // Vous pouvez ajouter +1 lors d'une attaque spécifique si nécessaire
        defense: 2,
        line: 3,
    },
    equites: {
        name: 'Equites',
        type: 'cavalerie lourde',
        description: "Cavalerie lourde composée de nobles et riches Romains. Leur charge triple leur valeur d'attaque pour la première attaque, mais les chevaux sont difficiles à contrôler.",
        health: 10,
        morale: 5,
        attack: 3,
        defense: 1,
        line: 3,
    },
};

// Définition des types d'unités pour Carthage
const carthageUnitTypes = {
    ibere: {
        name: 'Infanterie Ibère',
        type: 'infanterie légère',
        description: "Une infanterie légère formant l’avant-garde.",
        health: 10,
        morale: 5,
        attack: 3,
        defense: 1,
        line: 1,
    },
    gauloise: {
        name: 'Infanterie Gauloise',
        type: 'infanterie légère',
        description: "Une infanterie courageuse et susceptible de charges furieuses.",
        health: 10,
        morale: 10,
        attack: 4,
        defense: 0,
        line: 1,
    },
    libyen: {
        name: 'Lanciers Libyens',
        type: 'infanterie lourde',
        description: "Pouvant former une phalange, ils sont aussi utilisés comme piquiers contre la cavalerie (+1 puissance).",
        health: 10,
        morale: 5,
        attack: 4,
        defense: 2,
        line: 2,
    },
    numides: {
        name: 'Cavalerie Numides',
        type: 'cavalerie légère',
        description: "Cavalerie légère très mobile, capable d’harceler l’ennemi et de le poursuivre en cas de fuite.",
        health: 10,
        morale: 5,
        attack: 4,
        defense: 1,
        line: 3,
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