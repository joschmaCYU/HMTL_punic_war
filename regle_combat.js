// Vérifie si une unité est encore en état de combattre
function isUnitStillFighting(unit) {
    return unit.health > 0 && unit.morale > 0;
}

// Construit les lignes d'une armée à partir de ses cohortes et récupère les unités incapables de combattre 
function getArmyLinesAndIncapacitedUnits(armyCohorts) {
    let lines = [[], [], []];
    let incapacitedUnits = [];
    armyCohorts.forEach((unit, i) => {
        if (isUnitStillFighting(unit))
            lines[unit.line - 1].push(i);
        else
            incapacitedUnits.push(i);
    });
    return [lines, incapacitedUnits];
}

// Compare deux armées (ou deux ensembles de lignes) et renvoie laquelle est en supériorité numérique
function findOutnumberAndFewerFactions(allyLines, enemyLines) {
    let allyCount = allyLines.flat().length;
    let enemyCount = enemyLines.flat().length;
    let outnumberFaction = allyCount >= enemyCount ? 'ally' : 'enemy';
    let fewerFaction = outnumberFaction === 'ally' ? 'enemy' : 'ally';
    return [outnumberFaction, fewerFaction];
}

// Une fonction utilitaire pour vérifier si une valeur est numérique
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

// Gère une attaque : la puissance de l'attaquant est comparée à la résistance du défenseur
function launchAttack(strikingUnit, defendingUnit, overrideAttackValue = null) {
    if (defendingUnit.health <= 0) return;
    let attackValue = strikingUnit.attack;
    if (isNumeric(overrideAttackValue))
        attackValue = overrideAttackValue;
    // On soustrait la différence entre défense et attaque à la santé
    defendingUnit.health += (defendingUnit.defense - attackValue);
    if (defendingUnit.health <= 0)
        console.log(`Unit ${defendingUnit.name} has fallen!`);
}

// Crée un matching entre les unités d'une faction moins nombreuse et celles de la faction adverse
function createMatching(fewerFactionLines, outnumberFactionLines) {
    let matching = {};
    // On clone les lignes de l'armée en supériorité numérique pour les dépiler
    let outLines = outnumberFactionLines.map(line => [...line]);
    // Pour chaque unité de la faction moins nombreuse (flat pour récupérer les indices)
    fewerFactionLines.flat().forEach(unitIndex => {
        matching[unitIndex] = [];
        if (outLines[0].length > 0)
            matching[unitIndex].push(outLines[0].pop());
        else if (outLines[1].length > 0)
            matching[unitIndex].push(outLines[1].pop());
        else if (outLines[2].length > 0)
            matching[unitIndex].push(outLines[2].pop());
    });
    return matching;
}

// Fonction simulant une bataille entre deux armées. Chaque armée est ici un objet qui possède
// une propriété 'cohorts' (tableau d'unités). La bataille continue jusqu'à ce qu'une armée soit détruite
// ou mise en déroute (plus aucune unité en état de combattre).
function simulateBattle(army1, army2) {
    let round = 1;
    while (true) {
        console.log(`--- Round ${round} ---`);

        // Chaque unité engagée perd 1 point de moral à chaque tour
        army1.cohorts.forEach(unit => {
            if (isUnitStillFighting(unit))
                unit.morale = Math.max(0, unit.morale - 1);
        });
        army2.cohorts.forEach(unit => {
            if (isUnitStillFighting(unit))
                unit.morale = Math.max(0, unit.morale - 1);
        });

        // Récupération des lignes et des indices d'unités incapables de combattre
        const [lines1, incap1] = getArmyLinesAndIncapacitedUnits(army1.cohorts);
        const [lines2, incap2] = getArmyLinesAndIncapacitedUnits(army2.cohorts);

        // Vérification des conditions d'arrêt (toutes les unités d'une armée sont incapables)
        if (lines1.flat().length === 0) {
            console.log("Army 1 is defeated or in rout!");
            break;
        }
        if (lines2.flat().length === 0) {
            console.log("Army 2 is defeated or in rout!");
            break;
        }

        // Création des matching pour les deux sens d'attaque
        // Du point de vue de Army1 attaquant Army2
        let matching1 = createMatching(lines1, lines2);
        for (let unitIndex in matching1) {
            let targets = matching1[unitIndex];
            let attacker = army1.cohorts[unitIndex];
            targets.forEach(targetIndex => {
                let defender = army2.cohorts[targetIndex];
                if (isUnitStillFighting(attacker) && isUnitStillFighting(defender)) {
                    launchAttack(attacker, defender);
                    console.log(`Army1 unit ${attacker.name} strikes Army2 unit ${defender.name}`);
                }
            });
        }

        // Du point de vue de Army2 attaquant Army1
        let matching2 = createMatching(lines2, lines1);
        for (let unitIndex in matching2) {
            let targets = matching2[unitIndex];
            let attacker = army2.cohorts[unitIndex];
            targets.forEach(targetIndex => {
                let defender = army1.cohorts[targetIndex];
                if (isUnitStillFighting(attacker) && isUnitStillFighting(defender)) {
                    launchAttack(attacker, defender);
                    console.log(`Army2 unit ${attacker.name} strikes Army1 unit ${defender.name}`);
                }
            });
        }

        round++;
    }
}

// Exemple de constitution d'armées sous forme d'objet avec une propriété 'cohorts'
const armyRome = { cohorts: createArmy(['hastati', 'princeps', 'triarii', 'equites'], 'rome') };
const armyCarthage = { cohorts: createArmy(['ibere', 'gauloise', 'libyen', 'numides', 'elephants'], 'carthage') };

// Lancer la simulation de bataille
simulateBattle(armyRome, armyCarthage);