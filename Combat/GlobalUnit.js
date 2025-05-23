class Unit {
    constructor(name, type, health, attack, defense, speed, range, posX, posY) {
        this.name = name; // Nom de l'unité
        this.type = type; // Type (archer, guerrier, etc.)
        this.health = health; // Points de vie
        this.attack = attack; // Points d'attaque
        this.defense = defense; // Points de défense
        this.speed = speed; // Vitesse/initiative
        this.range = range; // Portée d'attaque
        posX = posX; // Position X sur la grille
        posY = posY; // Position Y sur la grille
    }

    isAlive() {
        return this.health > 0;
    }
}

export default Unit;