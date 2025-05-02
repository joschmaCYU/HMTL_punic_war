import Faction from "./game/Faction.js";
import Unit from "./game/Unit.js";
import Grid from "./game/Grid.js";
import PlacementInterface from "./game/PlacementInterface.js";
import CombatEngine from "./game/CombatEngine.js";
import AI from "./game/AI.js";

// Définir les factions et unités
const factions = [
    new Faction("Empire", [
        new Unit("Soldat", "Guerrier", 100, 20, 10, 5, 1),
        new Unit("Archer", "Archer", 80, 15, 5, 7, 3),
    ]),
    new Faction("Tribus nomades", [
        new Unit("Cavalier", "Cavalier", 120, 25, 15, 10, 1),
        new Unit("Lanceur", "Archer", 70, 10, 5, 6, 2),
    ]),
];

document.addEventListener("DOMContentLoaded", () => {
    const factionSelection = document.getElementById("faction-selection");
    const troopSelection = document.getElementById("troop-selection");
    const unitPlacement = document.getElementById("unit-placement");
    const combatResult = document.getElementById("combat-result");
    const gridContainer = document.getElementById("grid");
    const troopList = document.getElementById("troop-list");
    const resultText = document.getElementById("result-text");

    let selectedFaction = null;
    let playerUnits = [];
    let selectedTroops = [];
    let grid = null;

    // Gestion de la sélection de faction
    document.querySelectorAll('.faction-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const player = event.target.dataset.player;
            const faction = event.target.dataset.faction;

            // Supprime la classe 'selected' des autres boutons de faction pour ce joueur
            document.querySelectorAll(`#player${player}-faction-selection .faction-button`).forEach(btn => {
                btn.classList.remove('selected');
            });

            // Ajoute la classe 'selected' au bouton cliqué
            event.target.classList.add('selected');

            // Désactive la faction choisie pour l'autre joueur et change sa couleur en rouge
            const otherPlayer = player === "1" ? "2" : "1";
            document.querySelectorAll(`#player${otherPlayer}-faction-selection .faction-button`).forEach(btn => {
                if (btn.dataset.faction === faction) {
                    btn.disabled = true;
                    btn.classList.add('disabled');
                } else {
                    btn.disabled = false;
                    btn.classList.remove('disabled');
                }
            });

            // Active le bouton "Valider"
            const validateButton = document.querySelector(`#player${player}-validate-faction`);
            validateButton.disabled = false;

            // Cache la sélection de faction et affiche la sélection de troupes
            document.querySelector(`#player${player}-faction-selection`).style.display = 'none';
            const troopSelection = document.querySelector(`#player${player}-troop-selection`);
            troopSelection.style.display = 'block';

            // Génère une liste de troupes en fonction de la faction choisie
            const troopList = troopSelection.querySelector('.troop-list');
            troopList.innerHTML = ''; // Réinitialise la liste

            const troops = getTroopsByFaction(faction);
            troops.forEach(troop => {
                const troopButton = document.createElement('button');
                troopButton.textContent = troop;
                troopButton.classList.add('troop-button');
                troopList.appendChild(troopButton);
            });
        });
    });

    // Gestion du bouton "Valider"
    document.querySelectorAll('.validate-faction-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const player = event.target.dataset.player;

            // Cache la sélection de faction et affiche la sélection de troupes
            document.querySelector(`#player${player}-faction-selection`).style.display = 'none';
            document.querySelector(`#player${player}-troop-selection`).style.display = 'block';
        });
    });

    document.querySelectorAll('.troop-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const player = event.target.closest('.troop-list').dataset.player;
            const troopName = event.target.textContent;

            // Ajoute la troupe sélectionnée à une liste temporaire pour le joueur
            const selectedTroopsContainer = document.querySelector(`#player${player}-troop-selection .selected-troops`);
            const troopItem = document.createElement('div');
            troopItem.textContent = troopName;
            troopItem.classList.add('selected-troop');
            selectedTroopsContainer.appendChild(troopItem);

            // Désactive le bouton pour éviter les doublons
            event.target.disabled = true;
        });
    });

    function getTroopsByFaction(faction) {
        const factions = {
            empire: ['Archer', 'Lancier', 'Chevalier'],
            horde: ['Berserker', 'Chaman', 'Cavalier'],
            mages: ['Mage de feu', 'Mage de glace', 'Invocateur']
        };
        return factions[faction] || [];
    }

    // Affichage des options de troupes
    function displayTroopOptions(units) {
        troopList.innerHTML = "";
        units.forEach((unit, index) => {
            const troopItem = document.createElement("div");
            troopItem.classList.add("troop-item");
            troopItem.textContent = `${unit.name} (PV: ${unit.health}, ATK: ${unit.attack}, DEF: ${unit.defense})`;
            troopItem.addEventListener("click", () => selectTroop(unit, index));
            troopList.appendChild(troopItem);
        });
    }

    // Sélection des troupes
    function selectTroop(unit, index) {
        if (!selectedTroops.includes(unit)) {
            selectedTroops.push(unit);
            alert(`${unit.name} ajouté à votre armée.`);
        } else {
            alert(`${unit.name} est déjà sélectionné.`);
        }
    }

    // Validation de la sélection des troupes
    document.getElementById("validate-troop-selection").addEventListener("click", () => {
        if (selectedTroops.length === 0) {
            alert("Veuillez sélectionner au moins une troupe.");
            return;
        }
        troopSelection.style.display = "none";
        unitPlacement.style.display = "block";
        initializeGrid();
    });

    // Initialisation de la grille
    function initializeGrid() {
        grid = new Grid(8);
        gridContainer.innerHTML = "";
        for (let i = 0; i < grid.size; i++) {
            const row = document.createElement("div");
            row.classList.add("grid-row");
            for (let j = 0; j < grid.size; j++) {
                const cell = document.createElement("div");
                cell.classList.add("grid-cell");
                cell.dataset.x = i;
                cell.dataset.y = j;
                cell.addEventListener("click", () => placeUnit(i, j));
                row.appendChild(cell);
            }
            gridContainer.appendChild(row);
        }
    }

    // Placement des unités
    function placeUnit(x, y) {
        if (selectedTroops.length > 0) {
            const unit = selectedTroops.shift();
            try {
                grid.placeUnit(x, y, unit);
                const cell = document.querySelector(`.grid-cell[data-x='${x}'][data-y='${y}']`);
                cell.textContent = unit.name;
                cell.classList.add("occupied");
            } catch (error) {
                alert(error.message);
            }
        } else {
            alert("Toutes les unités ont été placées.");
        }
    }

    // Validation du placement
    document.getElementById("validate-placement").addEventListener("click", () => {
        unitPlacement.style.display = "none";
        combatResult.style.display = "block";
        startCombat();
    });

    // Démarrage du combat
    function startCombat() {
        const aiFaction = factions.find(f => f !== selectedFaction);
        const ai = new AI(aiFaction.units);
        const combatEngine = new CombatEngine(selectedTroops, aiFaction.units, grid);
        combatEngine.startCombat();
        resultText.textContent = "Combat terminé. Consultez la console pour les détails.";
    }
});