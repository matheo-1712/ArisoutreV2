const { getStatus } = require('mc-server-status');

// Voir le nombre de joueurs sur le serveur
async function nbJoueurs() {
    let result;
    try {
        result = await getStatus('antredesloutres.online', 25565);
        // console.log('Informations sur le serveur Minecraft :', result);
    } catch (error) {
        // console.error('Erreur lors de la récupération des informations sur le serveur Minecraft :', error);
        result = null;
    }
    const serverStatus = result;
    if (serverStatus && serverStatus.players) {
        const playersOnline = serverStatus.players.online;
        if (typeof playersOnline === 'number') {
            // console.log('Nombre de joueurs en ligne :', playersOnline);
            return playersOnline;
        } else {
            console.log('Le nombre de joueurs en ligne n\'est pas disponible. Utilisation de la valeur par défaut : 0');
            return 0;
        }
    } else {
        console.log('Aucuns joueurs connectés.');
        return 0;
    }
}

module.exports = { nbJoueurs };