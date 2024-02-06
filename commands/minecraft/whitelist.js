const { SlashCommandBuilder } = require('discord.js');
const { Rcon } = require('rcon-client');
const { serveur } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('Ajoute un pseudo à la whitelist. Ne fonctionne que si le serveur Vanilla est lancé.')
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('pseudo')
                .setDescription('Votre pseudonyme Minecraft.')
                .setRequired(true)),
    async execute(interaction) {
        const playerName = interaction.options.getString('pseudo');

        // Validation du pseudo
        if (!isValidPlayerName(playerName)) {
            return interaction.reply({ content: 'Pseudo invalide. Assurez-vous qu\'il a entre 3 et 16 caractères.', ephemeral: true });
        }
        // Se connecter au RCON
        try {
            // Protection du mot de passe RCON
            const rconPassword = serveur.rconPassword;
            if (!rconPassword) {
                throw new Error('Le mot de passe RCON n\'est pas défini dans la configuration.');
            }

            const rcon = await Rcon.connect({
                host: serveur.host,
                port: serveur.port,
                password: rconPassword,
            });

            // Envoyer la commande pour ajouter le joueur à la whitelist
            const response = await rcon.send(`whitelist add ${playerName}`);

            // Fermer la connexion RCON
            await rcon.end();
            if (response && response.includes('Added')) {

                // Si la réponse contient "Added", c'est que le joueur a été ajouté à la whitelist
                console.log(`Le joueur ${playerName} a été ajouté à la whitelist.`);
                return interaction.reply({ content: `Le joueur ${playerName} a été ajouté à la whitelist. \n \`\`${response}\`\` `, ephemeral: true });

            } else if (response && response.includes('already')) {

                // Si la réponse contient "already", c'est que le joueur est déjà dans la whitelist
                console.log(`Le joueur ${playerName} est déjà dans la whitelist.`);
                return interaction.reply({ content: `Le joueur ${playerName} est déjà dans la whitelist de ce serveur. \n \`\`${response}\`\` `, ephemeral: true });

            } else {

                // Si la réponse ne contient pas "Added" ou "already", c'est qu'il y a eu une erreur
                console.log(`Le joueur ${playerName} n'a pas été ajouté à la whitelist.`);
                return interaction.reply({ content: `Le joueur ${playerName} n'a pas été ajouté à la whitelist merci de vérifier si le serveur est bien en ligne. \n \`\`${response}\`\` `, ephemeral: true });

            }
        } catch (error) {
            console.error('Erreur RCON :', error);
            return interaction.reply({ content: 'Une erreur est survenue lors de l\'ajout à la whitelist.', ephemeral: true });
        }
    },
};

// Fonction pour valider le pseudo
function isValidPlayerName(playerName) {
    return playerName.length >= 3 && playerName.length <= 16;
}
