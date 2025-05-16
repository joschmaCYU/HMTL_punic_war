window.onload = function() {
    const params = new URLSearchParams(window.location.search);
    const placement = params.get('troop_placement');
    if (!placement) return;

    // Correspondance ID -> nom image
    const idToName = {
        1: 'légionnaire',
        2: 'Archer',
        3: 'Cavalier',
        4: 'Éléphant de guerre',
        5: 'Lancier',
        6: 'Frondeur'
    };

    // Crée la grille 10x10
    const grid = document.querySelector('.grid');
    grid.innerHTML = '';
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        grid.appendChild(cell);
    }

    // Place chaque troupe
    placement.split(',').forEach(entry => {
        // Format: joueur:row-col:id
        const [player, pos, id] = entry.split(':');
        let [row, col] = pos.split('-').map(Number);

        // Laisse une bande vide centrale (ex: colonnes 4 et 5)
        if ((player === '1' && col >= 4) || (player === '2' && col <= 5)) return;

        const name = idToName[parseInt(id, 10)];
        if (!name) return;

        // Calcul index dans la grille
        const cellIndex = row * 10 + col;
        const cell = grid.children[cellIndex];

        // Ajoute l'image dans la cellule
        const img = document.createElement('img');
        img.src = `../image/${name}.png`;
        img.alt = name;
        img.className = 'troop-item';
        img.style.width = '100%';
        img.style.height = '100%';
        cell.appendChild(img);
    });
};