const { getStatus } = require('mc-server-status');

// Vérifier si le serveur est en ligne
async function getServerIsOnline() {
    try {
        const result = await getStatus('antredesloutres.online', 25565);
        // console.log('Informations sur le serveur Minecraft :', result);

        if (result.ping >= 0) {
           // console.log('Le serveur est en ligne.');
            return true;
        } else {
           // console.log('Le serveur est hors ligne.');
            return false;
        }
    } catch (error) {
       // console.error('Erreur lors de la récupération des informations sur le serveur Minecraft :', error);
        return false;
    }
}

module.exports = { getServerIsOnline };
