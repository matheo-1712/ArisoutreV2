// Import des modules nécessaires
const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { activityArisoutre } = require('../utils/arisoutre/activity');
const { minecraftToDiscord } = require('../utils/minecraft/minecraftToDiscord');
const { verifHeure, envoyerMessage } = require('../utils/genshin/dailyGI');
const { majStats } = require('../utils/minecraft/majStats');
const { pkDataToJson } = require('../utils/minecraft/dataPixelmon');

// Module.exports pour l'événement ClientReady
module.exports = {
    name: Events.ClientReady,
    once: true,
    execute: async (client) => {
        // Message de démarrage
        console.log(`La loutre sort de son sommeil et apparaît via son compte : ${client.user.tag}`);

        // Fonction du statut
        setInterval(async () => { // Fonction asynchrone
            activityArisoutre(client);
            /*if (verifHeure()) {
                envoyerMessage();
            }*/
        }, 15000); // 15 secondes

        // Fonction de mise à jour des stats
        setInterval(async () => {
            // Fonction asynchrone pour la mise à jour des stats
            await majStats();
            await pkDataToJson();
        }, 24 * 60 * 60 * 1000); // Interval de 24 heures


        // Initialisation de tail
        minecraftToDiscord(client);

        // Surveiller les modifications dans le fichier server.json
        serverJsonPath = path.join(__dirname, '../../Arisoutre/triggers/serverActuel.json');
        fs.watch(serverJsonPath, (eventType, filename) => {
            if (eventType === 'change') {
                console.log('Changement dans server.json détecté. Relance de la fonction...');
                minecraftToDiscord(client);
            }
        });
    },
};




