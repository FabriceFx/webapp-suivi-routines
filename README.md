# Webapp Suivi Routines


[🇫🇷 Version Française](#-version-française) | [🇬🇧 English Version](#-english-version)

![License MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Platform](https://img.shields.io/badge/Platform-Google%20Apps%20Script-green)
![Runtime](https://img.shields.io/badge/Google%20Apps%20Script-V8-green)
![Author](https://img.shields.io/badge/Auteur-Fabrice%20Faucheux-orange)

## 🇫🇷 Version Française


Une solution complète et autonome ("Self-Hosted") de suivi d'activités et d'habitudes, propulsée par **Google Apps Script**. Cette application Web permet de logger des routines quotidiennes (avec ou sans quantités) depuis un mobile ou un ordinateur, et de visualiser la constance via des tableaux de bord interactifs.

## 🚀 Fonctionnalités clés

* **Saisie hybride** : Supporte les routines simples (Oui/Non) et quantitatives (ex: "10 km", "30 mins").
* **Historique intelligent** : Possibilité d'annuler la dernière saisie et gestion des dates rétroactives.
* **Tableau de bord Heatmap** : Visualisation matricielle mensuelle avec intensité de couleur selon l'atteinte des objectifs.
* **Analyses graphiques** : Répartition (Camembert) et Constance (Ligne) générées dynamiquement.

## 🛠️ Architecture & stack technique

Le projet respecte désormais une architecture **MVC** (Modèle-Vue-Contrôleur) séparée pour une meilleure maintenabilité :

* **`Code.gs` (Backend)** : Logique serveur Apps Script, interaction avec Google Sheets et routage HTML.
* **`Index.html` (Structure)** : Squelette HTML5 principal utilisant Bootstrap 5.
* **`Style.html` (Design)** : Feuilles de styles CSS isolées pour l'interface.
* **`JavaScript.html` (Logique Client)** : Gestion du DOM, des événements et des graphiques Chart.js.

## 📋 Prérequis Google Sheets

Votre feuille de calcul doit contenir **exactement** ces deux onglets :

### 1. Onglet `Config`
Définit vos habitudes et objectifs.
* **Ligne 1 (En-têtes)** : `Nom` | `Objectif` | `Unité`
* **Colonnes** :
    * **A** : Nom de la routine (ex: `Lecture`).
    * **B** : Objectif chiffré (ex: `30` pour 30 minutes). *Optionnel*.
    * **C** : Unité d'affichage (ex: `min`, `km`). *Si vide, mode case à cocher*.

### 2. Onglet `Logs`
Base de données brute. Ne pas modifier manuellement sauf si nécessaire.
* **Ligne 1 (En-têtes)** : `Date` | `Routine` | `Valeur`
* **Logique** : Le script ajoute les nouvelles entrées à la suite.

## ⚙️ Installation manuelle

1.  Ouvrez votre Google Sheet.
2.  Allez dans **Extensions** > **Apps Script**.
3.  **Backend** : Copiez le contenu fourni pour `Code.gs` dans l'éditeur.
4.  **Frontend** : Créez 3 fichiers HTML distincts (via le bouton `+`) :
    * Nommez le premier `Index` et collez le code HTML de structure.
    * Nommez le second `Style` et collez le code CSS.
    * Nommez le troisième `JavaScript` et collez le code JS client.
5.  Cliquez sur **Déployer** > **Nouveau déploiement**.
6.  Choisissez le type **Application Web**.
    * *Exécuter en tant que* : `Moi`.
    * *Qui a accès* : `Moi uniquement` (pour un usage personnel).
7.  Validez et utilisez l'URL fournie.


---
## 🇬🇧 English Version

> English translation coming soon.

---
<p align="center"><a href="https://faucheux.bzh" target="_blank" style="color: inherit; text-decoration: none;">&lt;&gt; par Fabrice Faucheux</a></p>