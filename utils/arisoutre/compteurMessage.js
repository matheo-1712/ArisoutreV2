const fs = require('fs');

// Fonction pour mettre à jour le fichier JSON avec le nombre de messages
function updateMessageCount(userId) {
    // Charger le contenu du fichier JSON
    const jsonData = fs.readFileSync('./ressources/data/discordStats.json', 'utf-8');
    // Analyser le contenu JSON en tant qu'objet JavaScript
    let data = JSON.parse(jsonData);

    // Vérifier si l'utilisateur existe déjà dans les données
    const userIndex = data.findIndex(entry => entry.idDiscord === userId);
    if (userIndex !== -1) {
        // L'utilisateur existe déjà, incrémenter le nombre de messages
        data[userIndex].nbMessages++;
    } else {
        // L'utilisateur n'existe pas encore, le créer avec un nombre de messages initial de 1
        data.push({ idDiscord: userId, nbMessages: 1 });
    }

    // Écrire les données mises à jour dans le fichier JSON
    fs.writeFileSync('./ressources/data/discordStats.json', JSON.stringify(data, null, 2));
}


module.exports = { updateMessageCount };