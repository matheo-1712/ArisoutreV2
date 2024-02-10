const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
const { sql } = require('../../config.json');

module.exports = {
    cooldown: 60,
    data: new SlashCommandBuilder()
        .setName('setuid')
        .setDescription('Enregistre ton UID Genshin.')
        .addStringOption(option =>
            option.setName('uid')
                .setDescription('Votre uid')
                .setRequired(true)),
    async execute(interaction) {
        try {
            // Récupérer l'UID Genshin dans l'interaction
            const userUid = interaction.options.getString('uid');
            // Enregistrer l'UID pour l'utilisateur
            const discordUserId = interaction.user.id; // Utiliser l'ID de l'utilisateur comme clé

            // Vérifier si l'utilisateur a déjà enregistré son ID Discord
            const isUserAlreadyRegistered = await verifEnregistrement(discordUserId);

            if (isUserAlreadyRegistered) {
                return await interaction.reply({ content: 'Vous avez déjà enregistré votre UID Genshin.', ephemeral: true });
            }

            // Créer une connexion à la base de données en utilisant mysql2
            const connection = await mysql.createConnection({
                host: sql.host,
                user: sql.user,
                password: sql.password,
                database: sql.database,
            });

            // Utiliser des paramètres pour éviter les injections SQL
            const query = 'INSERT INTO genshin_id (discord_user_id, genshin_user_id) VALUES (?, ?)';
            const [results, fields] = await connection.execute(query, [discordUserId, userUid]);

            // Fermer la connexion après l'insertion
            await connection.end();

            // Répondre à l'interaction pour indiquer que l'UID a bien été enregistré
            console.log(`L'utilisateur ${interaction.user.tag} a enregistré son UID Genshin : ${userUid} .`);
            await interaction.reply({ content: "L'UID du joueur a bien été enregistré.", ephemeral: true });

        } catch (error) {
            // Message d'erreur dans la console
            console.error('Erreur lors de l\'exécution de la commande :', error);

            // Répondre à l'interaction pour éviter l'erreur
            return interaction.reply({ content: 'Une erreur est survenue lors de l\'enregistrement de l\'UID.', ephemeral: true });
        }
    },
};

// Fonction pour vérifier si l'utilisateur a déjà enregistré son ID Discord
async function verifEnregistrement(discordUserId) {
    const connection = await mysql.createConnection({
        host: sql.host,
        user: sql.user,
        password: sql.password,
        database: sql.database,
    });

    const query = 'SELECT * FROM genshin_id WHERE discord_user_id = ?';
    const [rows, fields] = await connection.execute(query, [discordUserId]);

    await connection.end();

    return rows.length > 0;
}
