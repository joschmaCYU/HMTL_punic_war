class AI {
    constructor(units) {
        this.units = units; // Unités contrôlées par l'IA
    }

    decideAction(units, playerUnits) {
        const actions = [];
        for (let unit of units) {
            if (!unit.isAlive()) continue;
            const target = this.findWeakestOrClosest(unit, playerUnits);
            if (target) {
                actions.push({ attacker: unit, target });
            }
        }
        return actions;
    }

    findWeakestOrClosest(unit, targets) {
        return targets.filter(t => t.isAlive()).sort((a, b) => a.health - b.health || this.distance(unit, a) - this.distance(unit, b))[0];
    }

    distance(unitA, unitB) {
        // Calcul simplifié de la distance (à adapter selon la grille)
        return Math.abs(unitA.x - unitB.x) + Math.abs(unitA.y - unitB.y);
    }
}

export default AI;