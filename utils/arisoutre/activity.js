const { ActivityType } = require('discord.js');
const { nbJoueurs } = require('../minecraft/getNbJoueurs');

async function activityArisoutre(client) {
    let joueurs = 'Joueurs en ligne : ';
    const playersOnline = await nbJoueurs();
    if (playersOnline === 0) {
        joueurs = 'Aucun joueur en ligne';
    } else if (playersOnline > 0) {
        joueurs += playersOnline;
    }
    client.user.setActivity(`${joueurs}`, { type: ActivityType.Watching });
}

module.exports = { activityArisoutre };
