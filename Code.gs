/**
 * Point d'entrée de l'application Web.
 * Charge le template HTML principal et injecte les dépendances.
 *
 * @author Fabrice Faucheux
 * @return {HtmlOutput} Le contenu HTML évalué.
 */
function doGet() {
  try {
    return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('App Suivi Routines')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (erreur) {
    console.error('Erreur doGet :', erreur);
    return HtmlService.createHtmlOutput("Erreur critique lors du chargement.");
  }
}

/**
 * Fonction utilitaire pour inclure des fichiers HTML/CSS/JS externes.
 * Permet la modularité du code frontend.
 *
 * @param {string} nomFichier - Le nom du fichier à inclure (ex: 'JavaScript').
 * @return {string} Le contenu du fichier.
 */
function include(nomFichier) {
  return HtmlService.createHtmlOutputFromFile(nomFichier).getContent();
}

// --- LOGIQUE MÉTIER (SHEETS) ---

/**
 * Supprime la dernière entrée de l'onglet Logs.
 */
function supprimerDerniereEntree() {
  try {
    const feuille = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Logs");
    const derniereLigne = feuille.getLastRow();

    if (derniereLigne > 1) {
      const valeurSupprimee = feuille.getRange(derniereLigne, 2).getValue();
      feuille.deleteRow(derniereLigne);
      return `🗑️ Entrée '${valeurSupprimee}' supprimée.`;
    } else {
      throw new Error("Historique vide.");
    }
  } catch (e) {
    throw new Error(e.message);
  }
}

/**
 * Enregistre une routine avec gestion optionnelle de quantité et date rétroactive.
 */
function sauvegarderRoutine(nomRoutine, dateIso, valeur) {
  try {
    const feuille = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Logs");
    
    // Date : fournie ou maintenant
    let dateLog;
    if (dateIso) {
      dateLog = new Date(dateIso);
      dateLog.setHours(12, 0, 0, 0);
    } else {
      dateLog = new Date();
    }

    const valeurStockee = (valeur !== undefined && valeur !== null) ? valeur : "";
    feuille.appendRow([dateLog, nomRoutine, valeurStockee]);
    
    const optionsDate = { weekday: 'long', day: 'numeric', month: 'long' };
    const dateLisible = dateLog.toLocaleDateString('fr-FR', optionsDate);
    const msgVal = valeurStockee ? ` (${valeurStockee})` : "";

    return `✅ ${nomRoutine}${msgVal} enregistré le ${dateLisible} !`;
  } catch (e) {
    console.error(e);
    throw new Error(`Erreur sauvegarde : ${nomRoutine}`);
  }
}

/**
 * Récupère la config des routines (Nom, Objectif, Unité).
 */
function recupererListeRoutines() {
  try {
    const feuille = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
    const lastRow = feuille.getLastRow();
    if (lastRow < 2) return [];

    return feuille.getRange(2, 1, lastRow - 1, 3).getValues()
      .map(row => ({ nom: row[0], unite: row[2] ? row[2].toString() : "" }))
      .filter(r => r.nom !== "");
  } catch (e) {
    console.error(e);
    throw new Error("Erreur lecture config.");
  }
}

/**
 * Génère le rapport mensuel (Heatmap + Stats).
 */
function genererRapportMensuel(annee, mois) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const shLogs = ss.getSheetByName("Logs");
    const shConf = ss.getSheetByName("Config");

    // Config
    let config = [];
    if (shConf.getLastRow() > 1) {
      config = shConf.getRange(2, 1, shConf.getLastRow() - 1, 3).getValues()
        .map(r => ({ nom: r[0], objectif: r[1]||0, unite: r[2]||"" }))
        .filter(r => r.nom !== "");
    }

    // Logs
    let logs = [];
    if (shLogs.getLastRow() > 1) {
      logs = shLogs.getRange(2, 1, shLogs.getLastRow() - 1, 3).getValues();
    }

    // Traitement
    const rapport = {};
    const statsJour = {};
    config.forEach(c => rapport[c.nom] = {});
    
    const targetMonth = mois - 1;

    logs.forEach(row => {
      const [dRaw, nom, valRaw] = row;
      const d = new Date(dRaw);
      
      if (d.getFullYear() === annee && d.getMonth() === targetMonth) {
        const j = d.getDate();
        if (!rapport[nom]) rapport[nom] = {};
        
        const val = (valRaw && !isNaN(valRaw)) ? Number(valRaw) : 1;
        rapport[nom][j] = (rapport[nom][j] || 0) + val;
        statsJour[j] = (statsJour[j] || 0) + 1;
      }
    });

    return {
      routines: config,
      donnees: rapport,
      statsJournalieres: statsJour,
      joursDansLeMois: new Date(annee, mois, 0).getDate()
    };
  } catch (e) {
    console.error(e);
    throw new Error("Erreur rapport mensuel.");
  }
}
