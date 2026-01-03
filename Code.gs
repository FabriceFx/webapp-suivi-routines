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
 * Enregistre une nouvelle routine dans l'onglet "Logs".
 * Gère désormais une date personnalisée pour la saisie rétroactive.
 *
 * @author Fabrice Faucheux
 * @param {string} nomRoutine - Le nom de la routine à logger.
 * @param {string} [dateIso] - (Optionnel) La date choisie au format "YYYY-MM-DD".
 * @return {string} Message de confirmation.
 */
function sauvegarderRoutine(nomRoutine, dateIso) {
  try {
    const feuille = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Logs");
    let dateLog;

    if (dateIso) {
      // Si une date est fournie (Saisie rétroactive), on l'utilise.
      // On instancie la date et on fixe l'heure à midi pour éviter les décalages de fuseau horaire
      // qui pourraient basculer la date au jour précédent ou suivant selon l'affichage.
      dateLog = new Date(dateIso);
      dateLog.setHours(12, 0, 0, 0); 
    } else {
      // Sinon, on utilise l'horodatage exact de l'instant présent
      dateLog = new Date();
    }
    
    feuille.appendRow([dateLog, nomRoutine]);
    
    // Formatage de la date pour le message de retour (plus convivial)
    const optionsDate = { weekday: 'long', day: 'numeric', month: 'long' };
    const dateLisible = dateLog.toLocaleDateString('fr-FR', optionsDate);

    return `✅ ${nomRoutine} enregistré pour le ${dateLisible} !`;

  } catch (erreur) {
    console.error('Erreur dans sauvegarderRoutine :', erreur);
    throw new Error(`Erreur lors de la sauvegarde de : ${nomRoutine}`);
  }
}

/**
 * Récupère la configuration complète (Nom + Unité) pour l'interface de saisie.
 * * @author Fabrice Faucheux
 * @return {Object[]} Liste d'objets {nom, unite}.
 */
function recupererListeRoutines() {
  try {
    const feuille = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
    const derniereLigne = feuille.getLastRow();
    if (derniereLigne < 2) return [];

    // On récupère A (Nom), B (Objectif - ignoré ici), C (Unité)
    // On lit 3 colonnes pour être sûr d'avoir l'unité
    const valeurs = feuille.getRange(2, 1, derniereLigne - 1, 3).getValues();
    
    // On retourne un objet structuré pour le frontend
    return valeurs.map(ligne => ({
      nom: ligne[0],
      unite: ligne[2] ? ligne[2].toString() : "" // Colonne C
    })).filter(r => r.nom !== "");

  } catch (erreur) {
    console.error('Erreur recupererListeRoutines :', erreur);
    throw new Error("Impossible de récupérer les routines.");
  }
}

/**
 * Enregistre une routine avec sa valeur quantitative optionnelle.
 */
function sauvegarderRoutine(nomRoutine, dateIso, valeur) {
  try {
    const feuille = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Logs");
    let dateLog = dateIso ? new Date(dateIso) : new Date();
    dateLog.setHours(12, 0, 0, 0);

    // On stocke : Date | Nom | Valeur (ou vide)
    feuille.appendRow([dateLog, nomRoutine, valeur || ""]);
    
    const messageValeur = valeur ? ` (${valeur})` : "";
    return `✅ ${nomRoutine}${messageValeur} enregistré !`;
  } catch (erreur) {
    console.error('Erreur sauvegarderRoutine :', erreur);
    throw new Error(`Erreur sauvegarde : ${nomRoutine}`);
  }
}

/**
 * Génère le rapport mensuel avec gestion des valeurs quantitatives.
 */
function genererRapportMensuel(annee, mois) {
  try {
    const classeur = SpreadsheetApp.getActiveSpreadsheet();
    const logsSheet = classeur.getSheetByName("Logs");
    const configSheet = classeur.getSheetByName("Config");

    // 1. Config : Récupération Nom (A), Objectif (B), Unité (C)
    let configRoutines = [];
    const lastRowConfig = configSheet.getLastRow();
    if (lastRowConfig > 1) {
      configRoutines = configSheet.getRange(2, 1, lastRowConfig - 1, 3).getValues()
        .map(ligne => ({
          nom: ligne[0],
          objectif: ligne[1] || 0, // Peut être une fréquence OU une cible journalière
          unite: ligne[2] || ""    // Détermine le mode d'affichage
        }))
        .filter(r => r.nom !== "");
    }

    // 2. Logs : Date (A), Nom (B), Valeur (C)
    let logs = [];
    const lastRowLogs = logsSheet.getLastRow();
    if (lastRowLogs > 1) {
      // On lit 3 colonnes
      logs = logsSheet.getRange(2, 1, lastRowLogs - 1, 3).getValues();
    }

    // 3. Traitement
    const rapport = {}; // Format : { "Sport": { 1: 10, 5: 5 } } -> jour: valeur
    const statsJournalieres = {};

    // Init
    configRoutines.forEach(c => rapport[c.nom] = {});

    const moisIndex = mois - 1;

    logs.forEach(ligne => {
      const [dateBrute, nom, valeurBrute] = ligne;
      const dateLog = new Date(dateBrute);

      if (dateLog.getFullYear() === annee && dateLog.getMonth() === moisIndex) {
        const jour = dateLog.getDate();
        
        // Initialisation si routine archivée
        if (!rapport[nom]) rapport[nom] = {};

        // On additionne les valeurs du même jour (ex: 2 sessions de sport)
        // Si pas de valeur (booléen), on compte 1
        const valAjoutee = (valeurBrute && !isNaN(valeurBrute)) ? Number(valeurBrute) : 1;
        
        rapport[nom][jour] = (rapport[nom][jour] || 0) + valAjoutee;
        statsJournalieres[jour] = (statsJournalieres[jour] || 0) + 1;
      }
    });

    return {
      routines: configRoutines,
      donnees: rapport, // Structure modifiée : dictionnaire {jour: valeur}
      statsJournalieres: statsJournalieres,
      joursDansLeMois: new Date(annee, mois, 0).getDate()
    };

  } catch (e) {
    console.error(e);
    throw new Error("Erreur génération rapport.");
  }
}
