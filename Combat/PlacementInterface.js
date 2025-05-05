import Grid from "./Grid.js";
import Unit from "./Unit.js";

class PlacementInterface {
    constructor(grid, playerUnits) {
        this.grid = grid; // Grille de placement
        this.playerUnits = playerUnits; // Unités du joueur
    }

    displayGrid() {
        console.log("Affichage de la grille :");
        for (let row of this.grid.cells) {
            console.log(row.map(cell => (cell ? cell.name : "[ ]")).join(" "));
        }
    }

    placeUnit(x, y, unit) {
        try {
            this.grid.placeUnit(x, y, unit);
            console.log(`${unit.name} placé en (${x}, ${y})`);
        } catch (error) {
            console.error(error.message);
        }
    }

    validatePlacement() {
        console.log("Placement validé. Prêt pour le combat !");
    }
}

export default PlacementInterface;