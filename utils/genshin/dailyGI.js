function verifHeure() {
    // Vérifiez si le message doit être envoyé à l'heure spécifiée
    const maintenant = new Date();
    if (maintenant.getHours() === 2 && maintenant.getMinutes() === 0 && !messageEnvoye) {
        messageEnvoye = true; // Marquez le message comme envoyé pour aujourd'hui
        return true;
    } else {
        // Si l'heure actuelle ne correspond pas à l'heure d'envoi spécifiée, réinitialisez la variable
        messageEnvoye = false;
        return false;
    }
}

function envoyerMessage() {
    const canal = client.channels.cache.get('1158506558355931157');
    const joursDeLaSemaine = [
        'Dimanche',
        'Lundi',
        'Mardi',
        'Mercredi',
        'Jeudi',
        'Vendredi',
        'Samedi'
    ];
    const jourActuel = new Date().getDay();

    let embedColor; // Une variable pour stocker la couleur de l'embed
    let embedImage; // Une variable pour stocker l'image de l'embed

    if (jourActuel === 1 || jourActuel === 4) { // Lundi est 1 et Jeudi est 4
        embedColor = '#dea55c'; // Or pour Lundi et Jeudi
        embedImage = 'https://www.genshin-impact.fr/wp-content/uploads/2023/09/cycle2023_lunjeubis.jpg';
    } else if (jourActuel === 2 || jourActuel === 5) { // Mardi est 2 et Vendredi est 5
        embedColor = '#bb2d46'; // Rouge Rosé pour Mardi et Vendredi
        embedImage = 'https://www.genshin-impact.fr/wp-content/uploads/2023/09/cycle2023_marven.jpg';
    } else if (jourActuel === 3 || jourActuel === 6) { // Mercredi est 3 et Samedi est 6
        embedColor = '#00bf63'; // Vert pour Mercredi et Samedi
        embedImage = 'https://www.genshin-impact.fr/wp-content/uploads/2023/09/cycle2023_mersam.jpg';
    } else { // Si c'est Dimanche (jourActuel === 0)
        embedColor = '#ad0000'; // Rouge pour Dimanche
        embedImage = 'https://www.genshin-impact.fr/wp-content/uploads/2023/08/cycle2023_dimanche.jpg';
    }

    const embed = new EmbedBuilder() // Utilisez EmbedBuilder ici
        .setColor(embedColor)
        .setTitle(`Bonjour ! Voici les matériaux du : ${joursDeLaSemaine[jourActuel]}`)
        .setImage(embedImage)
        .setTimestamp()

    canal.send({ embeds: [embed] });
}

module.exports = { verifHeure, envoyerMessage }; // Exportez la fonction dailyGI