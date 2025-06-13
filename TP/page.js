const ressources = [{
    argent: 500,
    bois: 10,
    nourriture: 0
  }];

  function majressources()  {
    document.getElementById("argent").textContent = ressources[0].argent;
    document.getElementById("bois").textContent = ressources[0].bois;
    document.getElementById("nourriture").textContent = ressources[0].nourriture;
 
}

  window.onload = () => {
    majressources();
  };
  

