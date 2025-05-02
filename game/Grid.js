class Grid {
    constructor(size) {
        this.size = size; // Taille de la grille (ex : 8x8)
        this.cells = Array.from({ length: size }, () => Array(size).fill(null));
    }

    placeUnit(x, y, unit) {
        if (this.isValidPosition(x, y)) {
            this.cells[x][y] = unit;
        } else {
            throw new Error("Position invalide");
        }
    }

    isValidPosition(x, y) {
        return x >= 0 && y >= 0 && x < this.size && y < this.size && this.cells[x][y] === null;
    }
}

export default Grid;