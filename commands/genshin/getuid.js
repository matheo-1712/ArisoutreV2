const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
const { sql } = require('../../config.json');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('getuid')
        .setDescription('Voir l\'UID du joueur.')
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Membre du serveur')
                .setRequired(true)),
    async execute(interaction) {

        try {
            // Récupère le membre
            const member = interaction.options.getMember('membre');

            if (member) {

                // Exemple de méthode pour obtenir l'UID du membre (c'est à vous d'implémenter cette logique)
                const userUid = await obtenirUID(member.user.id);

                // Pseudo du membre
                const pseudo = member.user.username;

                // Titre de l'embed
                const embedTitle = `Informations sur le joueur : ${pseudo}`;

                // Description de l'embed
                const embedDesc = `UID du joueur : ${userUid}`;

                // Couleur de l'embed
                const embedColor = '#ffffff';

                if (userUid === 'UID Non trouvé') {
                    await interaction.reply({content: 'Ce membre n\'as pas d\'UID.', ephemeral: true });
                } else {
                    
                    const lienAkasha = `[Lien vers le site](https://akasha.cv/profile/${userUid})`;
                    const lienEnka = `[Lien vers le site](https://enka.network/u/${userUid})`;
                    // Créer un embed
                    
                    const embed = new EmbedBuilder()
                        .setTitle(embedTitle)
                        .setDescription(embedDesc)
                        .setColor(embedColor)
                        .setThumbnail(member.user.displayAvatarURL())
                        .addFields(
                            { name: 'Akasha :', value: lienAkasha, inline: true, url: `https://akasha.cv/profile/${userUid}` },
                            { name: 'Enka.network :', value: lienEnka, inline: true, url: `https://enka.network/u/${userUid}` },
                        )
                        .setTimestamp();

                    // Répondre à l'interaction pour éviter l'erreur
                    console.log(`L'utilisateur ${interaction.user.tag} a demandé l'UID de ${pseudo} : ${userUid} .`);
                    await interaction.reply({ embeds: [embed] });
                
                }

            } else {

                // Répondre à l'interaction pour éviter l'erreur
                await interaction.reply('Membre non trouvé.');

            }
        } catch (error) {

            // Message d'erreur dans la console
            console.error('Erreur lors de l\'exécution de la commande :', error);
            return interaction.reply({ content: 'Une erreur est survenue.', ephemeral: true });
       
        }
    }
};

// Fonction pour vérifier si l'utilisateur a déjà enregistré son ID Discord
async function obtenirUID(discordUserId) {
    try {
        const connection = await mysql.createConnection({
            host: sql.host,
            user: sql.user,
            password: sql.password,
            database: sql.database,
        });

        const query = 'SELECT * FROM genshin_id WHERE discord_user_id = ?';
        const [rows, fields] = await connection.execute(query, [discordUserId]);

        await connection.end();

        if (rows.length > 0) {
            // Si des résultats sont trouvés, retournez l'UID
            return rows[0].genshin_user_id; // Assurez-vous que la colonne s'appelle "uid"
        } else {
            // Si aucun résultat n'est trouvé, retournez 'UID Non trouvé'
            return 'UID Non trouvé';
        }
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'UID :', error);
        throw error; // Vous pouvez choisir de gérer l'erreur différemment si nécessaire
    }
}
