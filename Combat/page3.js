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

    // Création du conteneur principal centré
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = '1000px';
    container.style.height = '800px';
    container.style.background = '#f4f4f4';
    container.id = 'battlefield';
    container.style.margin = '40px auto';
    container.style.display = 'block';
    container.style.border = '2px solid #999';
    document.body.appendChild(container);

    // Placement des troupes
    // Grille 10 colonnes, 5 à gauche, 5 à droite, 200px de gap au centre
    const cellWidth = 80;  // (1000 - 200) / 10 = 80px
    const cellHeight = 80; // 800 / 10 = 80px
    const gap = 200;       // 200px de séparation centrale

    placement.split(',').forEach(entry => {
        const [player, pos, id] = entry.split(':');
        const [row, col] = pos.split('-').map(Number);
        const name = idToName[parseInt(id, 10)];
        if (!name) return;

        let left;
        if (col <= 4) {
            // Joueur 1, colonnes 0 à 4 (à gauche du gap)
            left = col * cellWidth;
        } else if (col >= 5 && col <= 9) {
            // Joueur 2, colonnes 5 à 9 (à droite du gap)
            left = (col - 5) * cellWidth + 5 * cellWidth + gap;
        } else {
            left = 0;
        }
        const top = row * cellHeight;

        // Création de l'élément troupe
        const troopDiv = document.createElement('div');
        troopDiv.className = 'troop';
        troopDiv.style.position = 'absolute';
        troopDiv.style.left = `${left}px`;
        troopDiv.style.top = `${top}px`;
        troopDiv.style.width = `${cellWidth}px`;
        troopDiv.style.height = `${cellHeight}px`;
        troopDiv.style.zIndex = 2;

        const img = document.createElement('img');
        img.src = `../image/${name}.png`;
        img.alt = name;
        img.style.width = '100%';
        img.style.height = '100%';
        troopDiv.appendChild(img);

        container.appendChild(troopDiv);
    });
}
