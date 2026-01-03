/**
 * Point d'entrée de l'application Web (Web App).
 * Charge le template HTML et définit les métadonnées.
 * * @author Fabrice Faucheux
 * @return {HtmlOutput} Le contenu HTML évalué.
 */
function doGet() {
  try {
    return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('App Suivi Routines')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (erreur) {
    console.error('Erreur lors du chargement de la Web App :', erreur);
    return HtmlService.createHtmlOutput("Une erreur est survenue lors du chargement de l'application.");
  }
}

// --- PARTIE 1 : SAISIE ---

/**
 * Récupère la liste des routines depuis l'onglet "Config".
 * * @author Fabrice Faucheux
 * @return {string[]} Un tableau contenant les noms des routines.
 */
function recupererListeRoutines() {
  try {
    const classeur = SpreadsheetApp.getActiveSpreadsheet();
    const feuille = classeur.getSheetByName("Config");
    const derniereLigne = feuille.getLastRow();

    if (derniereLigne < 2) return [];

    // Récupération en lot (batch) de la colonne A
    const valeurs = feuille.getRange(2, 1, derniereLigne - 1, 1).getValues();
    
    // Aplatissement du tableau 2D en 1D
    return valeurs.flat();

  } catch (erreur) {
    console.error('Erreur dans recupererListeRoutines :', erreur);
    throw new Error("Impossible de récupérer la liste des routines.");
  }
}

/**
 * Enregistre une nouvelle routine dans l'onglet "Logs" avec la date actuelle.
 * * @author Fabrice Faucheux
 * @param {string} nomRoutine - Le nom de la routine à logger.
 * @return {string} Message de confirmation.
 */
function sauvegarderRoutine(nomRoutine) {
  try {
    const feuille = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Logs");
    const dateActuelle = new Date();
    
    feuille.appendRow([dateActuelle, nomRoutine]);
    
    return `✅ ${nomRoutine} enregistré avec succès !`;

  } catch (erreur) {
    console.error('Erreur dans sauvegarderRoutine :', erreur);
    throw new Error(`Erreur lors de la sauvegarde de : ${nomRoutine}`);
  }
}

/**
 * Supprime la dernière entrée enregistrée dans l'onglet "Logs".
 * * @author Fabrice Faucheux
 * @return {string} Message de confirmation avec la valeur supprimée.
 */
function supprimerDerniereEntree() {
  try {
    const feuille = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Logs");
    const derniereLigne = feuille.getLastRow();

    if (derniereLigne > 1) {
      // Optimisation : on ne lit que la cellule nécessaire (Nom de la routine)
      const valeurSupprimee = feuille.getRange(derniereLigne, 2).getValue();
      feuille.deleteRow(derniereLigne);
      
      return `🗑️ Entrée '${valeurSupprimee}' supprimée.`;
    } else {
      throw new Error("L'historique est vide, aucune suppression possible.");
    }

  } catch (erreur) {
    console.error('Erreur dans supprimerDerniereEntree :', erreur);
    throw new Error(erreur.message);
  }
}

// --- PARTIE 2 : ANALYSE DES DONNÉES (Tableau + Graphiques) ---

/**
 * Génère un rapport mensuel des routines effectuées.
 * Trie les données par routine et calcule l'activité journalière.
 * * @author Fabrice Faucheux
 * @param {number} annee - L'année cible (ex: 2024).
 * @param {number} mois - Le mois cible (1 pour Janvier, 12 pour Décembre).
 * @return {Object} Objet contenant les routines, les données triées, les stats journalières et le nombre de jours.
 */
function genererRapportMensuel(annee, mois) {
  try {
    const classeur = SpreadsheetApp.getActiveSpreadsheet();
    const feuilleLogs = classeur.getSheetByName("Logs");
    const feuilleConfig = classeur.getSheetByName("Config");

    // 1. Récupération des routines configurées
    let toutesRoutines = [];
    const derniereLigneConfig = feuilleConfig.getLastRow();
    
    if (derniereLigneConfig > 1) {
      toutesRoutines = feuilleConfig.getRange(2, 1, derniereLigneConfig - 1, 1)
        .getValues()
        .flat();
    }

    // 2. Récupération des logs
    let logs = [];
    const derniereLigneLogs = feuilleLogs.getLastRow();

    if (derniereLigneLogs > 1) {
      logs = feuilleLogs.getRange(2, 1, derniereLigneLogs - 1, 2).getValues();
    }

    // 3. Initialisation des structures de données
    const rapport = {};
    const statsJournalieres = {};

    // Initialisation des tableaux vides pour chaque routine connue
    toutesRoutines.forEach(routine => {
      rapport[routine] = []; 
    });

    // 4. Traitement des données via méthodes itératives modernes
    // L'index du mois en JS est 0-11, donc on fait (mois - 1)
    const moisIndexJs = mois - 1;

    logs.forEach(ligne => {
      // Déstructuration pour plus de clarté
      const [dateLogBrute, nomRoutine] = ligne;
      const dateLog = new Date(dateLogBrute);

      // Vérification stricte de l'année et du mois
      if (dateLog.getFullYear() === annee && dateLog.getMonth() === moisIndexJs) {
        const jour = dateLog.getDate();

        // Remplissage du rapport par routine (si la routine existe encore dans la config ou le rapport)
        if (rapport.hasOwnProperty(nomRoutine)) {
          rapport[nomRoutine].push(jour);
        } else {
          // Gestion des routines archivées ou supprimées de la config mais présentes dans les logs
          rapport[nomRoutine] = [jour];
          if (!toutesRoutines.includes(nomRoutine)) {
            toutesRoutines.push(nomRoutine);
          }
        }

        // Calcul du total par jour (Opérateur ternaire ou logique OR pour l'incrémentation)
        statsJournalieres[jour] = (statsJournalieres[jour] || 0) + 1;
      }
    });

    // Calcul du nombre de jours dans le mois
    // Astuce : le jour 0 du mois suivant renvoie le dernier jour du mois courant
    const joursDansLeMois = new Date(annee, mois, 0).getDate();

    return {
      routines: toutesRoutines,
      donnees: rapport,           // ex: { "Sport": [1, 3, 5], "Lecture": [2, 4] }
      statsJournalieres: statsJournalieres, // ex: { "1": 5, "2": 3 }
      joursDansLeMois: joursDansLeMois
    };

  } catch (erreur) {
    console.error('Erreur dans genererRapportMensuel :', erreur);
    throw new Error("Impossible de générer le rapport mensuel.");
  }
}
