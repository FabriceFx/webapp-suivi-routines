# Webapp Suivi Routines

![License MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Platform](https://img.shields.io/badge/Platform-Google%20Apps%20Script-green)
![Runtime](https://img.shields.io/badge/Google%20Apps%20Script-V8-green)
![Author](https://img.shields.io/badge/Auteur-Fabrice%20Faucheux-orange)

Une solution complète et autonome ("Self-Hosted") de suivi d'activités et d'habitudes, propulsée par **Google Apps Script**. Cette application Web permet de logger des routines quotidiennes depuis un mobile ou un ordinateur, et de visualiser la constance via des tableaux de bord interactifs.

## 🚀 Fonctionnalités

* **Saisie intuitive** : Interface épurée pour enregistrer une routine en un clic.
* **Historique** : Possibilité d'annuler la dernière saisie en cas d'erreur.
* **Tableau de bord visuel** :
    * **Matrice de présence** : Vue calendaire mensuelle (style GitHub contributions).
    * **Graphiques** : Répartition par type (Donut) et évolution de la productivité (Ligne) via Chart.js.
* **Données** : Stockage sécurisé et accessible dans un Google Sheet personnel.

## 🛠️ Stack technique

* **Backend** : Google Apps Script (Moteur V8, ES6+).
* **Frontend** : HTML5, CSS3 (Bootstrap 5).
* **Visualisation** : Chart.js.
* **Base de données** : Google Sheets.

## 📋 Prérequis & configuration Google Sheets

Pour que l'application fonctionne, votre fichier Google Sheets doit impérativement contenir les deux onglets suivants :

### 1. Onglet `Config`
Utilisé pour définir la liste de vos routines.
* **Ligne 1** : En-tête (ex: `Nom de la Routine`).
* **Colonne A (A2:A)** : Liste des routines (ex: `Méditation`, `Sport`, `Lecture`).

### 2. Onglet `Logs`
Utilisé pour stocker l'historique.
* **Ligne 1** : En-têtes (ex: `Date`, `Routine`).
* **Données** : L'application écrira automatiquement dans les colonnes A (Date) et B (Nom).

## ⚙️ Installation

1.  Ouvrez votre Google Sheet.
2.  Allez dans **Extensions** > **Apps Script**.
3.  Copiez le contenu du fichier `Code.gs` dans l'éditeur de script (fichier `.gs`).
4.  Créez un fichier HTML nommé `Index.html` et copiez-y le code frontend.
5.  Cliquez sur **Déployer** > **Nouveau déploiement**.
6.  Sélectionnez le type **Application Web**.
    * *Exécuter en tant que* : `Moi`.
    * *Qui a accès* : `Moi uniquement` (ou autre selon besoin).
7.  Validez et récupérez l'URL de votre Web App.

