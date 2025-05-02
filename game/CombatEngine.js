class CombatEngine {
    constructor(playerUnits, aiUnits, grid) {
        this.playerUnits = playerUnits; // Unités du joueur
        this.aiUnits = aiUnits; // Unités de l'IA
        this.grid = grid; // Grille de combat
    }

    startCombat() {
        let allUnits = [...this.playerUnits, ...this.aiUnits];
        allUnits.sort((a, b) => b.speed - a.speed); // Tri par initiative

        while (this.playerUnits.some(unit => unit.isAlive()) && this.aiUnits.some(unit => unit.isAlive())) {
            for (let unit of allUnits) {
                if (!unit.isAlive()) continue;

                if (this.playerUnits.includes(unit)) {
                    this.playerAction(unit);
                } else {
                    this.aiAction(unit);
                }
            }
        }

        const result = this.playerUnits.some(unit => unit.isAlive()) ? "Victoire" : "Défaite";
        console.log(`Combat terminé : ${result}`);
    }

    playerAction(unit) {
        // Logique d'action du joueur (simplifiée pour l'instant)
        console.log(`${unit.name} attaque !`);
    }

    aiAction(unit) {
        const target = this.findTarget(unit, this.playerUnits);
        if (target) {
            console.log(`${unit.name} attaque ${target.name} !`);
            target.health -= Math.max(0, unit.attack - target.defense);
        }
    }

    findTarget(attacker, targets) {
        return targets.filter(t => t.isAlive()).sort((a, b) => a.health - b.health)[0];
    }
}

export default CombatEngine;