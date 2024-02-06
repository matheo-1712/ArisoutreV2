const fetch = require('node-fetch');

async function getPseudoFromUUID(uuid) {
    try {
        const result = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`);
        const json = await result.json();
        return json.name;
    } catch (error) {
        console.error('Erreur lors de la récupération du pseudo à partir de l\'UUID :', error);
        return '';
    }
}

async function getUUIDFromPseudo(pseudo) {
    try {
        const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${pseudo}`);
        const data = await response.json();
        const UUID = data.id;

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
        }

        return UUID;
    } catch (error) {
        console.error(`Erreur lors de la récupération de l'UUID pour ${pseudo}: ${error.message}`);
        return null;
    }
}


module.exports = { getPseudoFromUUID, getUUIDFromPseudo };