<div id="cheval1" class="cheval">🐎</div>
<div id="cheval2" class="cheval">🐎</div>
<div id="cheval3" class="cheval">🐎</div>
<button onclick="demarrerCourse()">Démarrer la course</button>

<style>
  .cheval {
    position: relative;
    margin: 10px;
    font-size: 24px;
  }
</style>


function demarrerCourse() {
    let pos1 = 0, pos2 = 0, pos3 = 0;
    const finishLine = 80; // en pixels
  
    const interval = setInterval(() => {
      // Chaque cheval avance d'une valeur aléatoire entre 1 et 10
      pos1 += Math.floor(Math.random() * 10) + 1;
      pos2 += Math.floor(Math.random() * 10) + 1;
      pos3 += Math.floor(Math.random() * 10) + 1;
  
      // Mise à jour de l'affichage
      document.getElementById("cheval1").style.left = pos1 + "px";
      document.getElementById("cheval2").style.left = pos2 + "px";
      document.getElementById("cheval3").style.left = pos3 + "px";
  
      // Vérifie si un cheval a franchi la ligne d'arrivée
      if (pos1 >= finishLine || pos2 >= finishLine || pos3 >= finishLine) {
        clearInterval(interval);
  
        let gagnant;
        if (pos1 >= finishLine) gagnant = "Cheval 1";
        else if (pos2 >= finishLine) gagnant = "Cheval 2";
        else gagnant = "Cheval 3";
  
        alert(`${gagnant} a gagné la course !`);
      }
    }, 300);
  }

  | Notion                    | Exemple                                                |
| ------------------------- | ------------------------------------------------------ |
| Déclarer une variable     | `let score = 0;`                                       |
| Créer une fonction        | `function startGame() {}`                              |
| Math.random()             | `Math.floor(Math.random() * 10)` → entier entre 0 et 9 |
| setInterval / setTimeout  | `setInterval(() => {...}, 1000);`                      |
| Modifier le DOM           | `document.getElementById("id").textContent = "Texte"`  |
| Ajout de classes / styles | `element.classList.add("maClasse")`                    |
| Conditions                | `if (a > b) { ... }`                                   |
| Boucles                   | `for (let i = 0; i < 3; i++) {}`                       |

  