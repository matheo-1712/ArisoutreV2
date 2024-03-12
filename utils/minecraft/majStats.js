async function majStats() {

    const mysql = require('mysql2/promise');
    const { sql } = require('../../config.json');
    const fetch = require('node-fetch');
    const fs = require('fs').promises;

    const path = require('path');
    // Définir le chemin du dossier de stats de chaque serveur
    const serveursPath = '/home/minecraft/';

    // Fonction pour lire les fichiers de stats
    async function lireStatsServeur(nomServeur, nomMonde, version) {
        const cheminServeur = path.join(serveursPath, nomServeur, nomMonde, 'stats');

        try {
            const fichiersJoueurs = await fs.readdir(cheminServeur);

            for (const fichierJoueur of fichiersJoueurs) {
                const uuid = path.basename(fichierJoueur, '.json');
                const cheminJoueur = path.join(cheminServeur, fichierJoueur);
                const statsJoueur = JSON.parse(await fs.readFile(cheminJoueur, 'utf-8'));

                // Obtenir le pseudo associé à l'UUID
                const pseudo = await getPseudoFromUUID(uuid);
                const nom_serv = nomServeur;

                // Traitez les statistiques du joueur

                // -- Temps de jeux
                const tempsJeuxPre113 = Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:play_one_minute'] / 20 / 3600) || 0;
                const tempsJeuxAft113 = Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:play_time'] / 20 / 3600) || 0;
                const tempsJeux = Math.max(tempsJeuxPre113, tempsJeuxAft113);

                // -- Morts
                const nbMorts = Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:deaths']) || 0;

                // -- Distances
                const distMarche = Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:walk_one_cm'] / 100) || 0;
                const distSprint = Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:sprint_one_cm'] / 100) || 0;
                const distSneak = Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:crouch_one_cm'] / 100) || 0;
                const distCheval = Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:horse_one_cm'] / 100) || 0;
                const distMinecart = Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:minecart_one_cm'] / 100) || 0;
                const distChute = Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:fall_one_cm'] / 100) || 0;
                const distEscalade = Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:climb_one_cm'] / 100) || 0;
                const distAviate = Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:aviate_one_cm'] / 100) || 0;
                const distBateau = Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:boat_one_cm'] / 100) || 0;
                const distMarcheSurEau = Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:walk_on_water_one_cm'] / 100) || 0;
                const distMarcheSousEau = Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:walk_under_water_one_cm'] / 100) || 0;
                const distNage = Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:swim_one_cm'] / 100) || 0;

                // -- Totaux distance
                const distTotalePied = distMarche + distSprint + distSneak;
                const distTotaleVehicule = distCheval + distBateau + distAviate;
                const distTotaleDansEau = distMarcheSurEau + distMarcheSousEau + distNage;
                const distChuteEscalade = distChute + distEscalade;
                const distTotale = distMarche + distSprint + distSneak + distCheval + distMinecart + distChute + distEscalade + distAviate + distBateau + distMarcheSurEau + distMarcheSousEau + distNage;

                console.log(`Statistiques pour ${pseudo}:, ${tempsJeux}, heures de jeu, ${nbMorts} mort, ${distTotale} bloc marché sur le serveur ${nom_serv}`);
                insertStats(uuid, tempsJeux, nbMorts, distTotale, nom_serv, pseudo);
            }
        } catch (erreur) {
            console.error(`Erreur lors de la lecture des stats du serveur ${nomServeur}:`, erreur);
        }
    }


    // Obtenir la liste des serveurs actifs depuis la base de données
    const serveursActifs = await obtenirServeursActifs();
    const mondesActifs = await obtenirNomMonde();
    const versions = await obtenirVersion(); // Fix: Change the variable name to 'versions'

    // Lire les stats pour chaque serveur actif
    // Iterate over each combination of server, world, and version
    for (let i = 0; i < serveursActifs.length; i++) {
        const serveur = serveursActifs[i];
        const monde = mondesActifs[i];
        const version = versions[i].version; // Fix: Access the 'version' property

        // Read stats for the current combination of server, world, and version
        await lireStatsServeur(serveur.nom_serv, monde.nom_monde, version);
    }


    // Fonction pour obtenir la liste des serveurs actifs depuis la base de données
    async function obtenirServeursActifs() {
        try {
            const connection = await mysql.createConnection({
                host: sql.host,
                user: sql.user,
                password: sql.password,
                database: sql.database,
            });

            // Requête SQL
            const query = 'SELECT nom_serv FROM infos_serv;';

            // Exécution de la requête
            const [rows] = await connection.execute(query);

            // Fermeture de la connexion
            await connection.end();

            // Extraction des noms de serveurs du résultat
            return rows.map(row => ({ nom_serv: row.nom_serv }));
        } catch (error) {
            console.error('Erreur lors de la connexion à la base de données :', error);
            return [];
        }
    }

    async function obtenirNomMonde() {
        try {
            const connection = await mysql.createConnection({
                host: sql.host,
                user: sql.user,
                password: sql.password,
                database: sql.database,
            });

            // Requête SQL
            const queryNomMonde = 'SELECT nom_monde FROM infos_serv;';

            // Exécution de la requête
            const [rows] = await connection.execute(queryNomMonde);

            // Fermeture de la connexion
            await connection.end();

            // Extraction des noms de monde du résultat
            return rows.map(row => ({ nom_monde: row.nom_monde }));
        } catch (error) {
            console.error('Erreur lors de la connexion à la base de données :', error);
            return [];
        }
    }

    async function obtenirVersion() {
        try {
            const connection = await mysql.createConnection({
                host: sql.host,
                user: sql.user,
                password: sql.password,
                database: sql.database,
            });

            // Requête SQL
            const query = 'SELECT version_serv FROM infos_serv;';

            // Exécution de la requête
            const [rows] = await connection.execute(query);

            // Fermeture de la connexion
            await connection.end();

            // Extraction des noms de monde du résultat
            return rows.map(row => ({ version: row.version }));
        } catch (error) {
            console.error('Erreur lors de la connexion à la base de données :', error);
            return [];
        }
    }

    async function getPseudoFromUUID(uuid) {
        // Construire l'URL de l'API Mojang
        const apiUrl = `https://api.minetools.eu/uuid/${uuid}`;

        try {
            // Faire une requête HTTP pour obtenir les informations du joueur
            const response = await fetch(apiUrl);

            if (!response.ok) {
                console.error(`La requête API Mojang a échoué avec le statut : ${response.status}`);
                return null;
            }

            const data = await response.json();

            if (data.hasOwnProperty('name')) {
                const pseudo = data.name;
                // console.log(`Le pseudo du joueur avec l'UUID ${uuid} est : ${pseudo}`);
                return pseudo;
            } else {
                console.error(`Aucun pseudo trouvé pour l'UUID ${uuid}`);
                return null;
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des informations du joueur :', error);
            return null;
        }
    }

    async function insertStats(uuid, tempsJeux, nbMorts, distTotale, server, pseudo) {
        let connection;

        try {
            connection = await mysql.createConnection({
                host: sql.host,
                user: sql.user,
                password: sql.password,
                database: sql.database,
            });

            // Récupération de l'id du serveur
            const id_server_query = `SELECT id_serv FROM infos_serv WHERE nom_serv = ?`;
            const [id_server_rows] = await connection.execute(id_server_query, [server]);

            if (id_server_rows.length > 0) {
                const id_server = id_server_rows[0].id_serv;

                // Vérification si l'uuid et le serveur existent déjà
                const checkQuery = `SELECT * FROM stats_serv WHERE uuid_minecraft = ? AND id_serv = ?`;
                const [checkRows] = await connection.execute(checkQuery, [uuid, id_server]);

                if (checkRows.length > 0) {
                    // Pseudo et serveur existent déjà, donc mise à jour des données
                    const updateQuery = `UPDATE stats_serv SET temp_jeux = ?, nb_mort = ?, distTotale = ?, username = ? WHERE uuid_minecraft = ? AND id_serv = ?`;
                    await connection.execute(updateQuery, [tempsJeux, nbMorts, distTotale, pseudo, uuid, id_server]);
                    console.log(`Données mises à jour pour ${uuid} sur le serveur ${server}.`);
                } else {
                    // Pseudo ou serveur n'existe pas, donc insertion de nouvelles données
                    const insertQuery = `INSERT INTO stats_serv (temp_jeux, nb_mort, distTotale, username, id_serv, uuid_minecraft) VALUES (?, ?,? , ?, ?, ?)`;
                    await connection.execute(insertQuery, [tempsJeux, nbMorts, distTotale, pseudo, id_server, uuid]);
                    console.log(`Nouvelles données insérées pour ${uuid} sur le serveur ${server}.`);
                }
            } else {
                console.error(`Serveur non trouvé : ${server}`);
            }
        } catch (error) {
            console.error(`Erreur lors de l'exécution de la requête : ${error.message}`);
        } finally {
            // Fermeture de la connexion
            if (connection) {
                await connection.end();
            }
        }
    }
}

module.exports = { majStats };