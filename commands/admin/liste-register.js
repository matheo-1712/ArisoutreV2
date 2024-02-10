const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { sql } = require('../../config.json');
const mysql = require('mysql2/promise');
const fetch = require('node-fetch');
const { getPseudoFromUUID } = require('../../utils/minecraft/UUID');

module.exports = {
    cooldown: 120,
    data: new SlashCommandBuilder()
        .setName('liste-register')
        .setDescription('Liste les joueurs enregistrés avec leur nom de compte Minecraft.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),
    async execute(interaction) {

        try {
            // Créer l'embed avec les informations de la liste des joueurs
            await interaction.reply('Voici la liste des joueurs enregistrés avec leur tag Discord et UUID Minecraft:');
            
            const connection = await mysql.createConnection({
                host: sql.host,
                user: sql.user,
                password: sql.password,
                database: sql.database,
            });

            const query = 'SELECT * FROM mc_link_discord';
            const [rows] = await connection.execute(query);

            if (rows.length > 0) {
                console.log('Résultats de la requête :');

                // Initialiser un tableau pour stocker les informations de chaque joueur
                const playerList = [];

                // Récupérer le client Discord associé à l'interaction
                const client = interaction.client;

                // Parcourir les résultats de la requête
                for (const row of rows) {
                    const idDiscord = row.id_discord;
                    const uuidMinecraft = row.uuid_minecraft.replace(/-/g, '');

                    // Utiliser la fonction getPseudoFromUUID pour récupérer le pseudo Minecraft
                    const pseudoMinecraft = await getPseudoFromUUID(uuidMinecraft);

                    // Récupérer l'utilisateur Discord directement par son ID
                    const user = await client.users.fetch(idDiscord).catch(() => null);

                    // Récupérer le tag Discord s'il existe
                    const discordTag = user ? user.tag : 'Utilisateur introuvable';

                    // Ajouter les informations du joueur au tableau
                    playerList.push({
                        discordTag: discordTag,
                        uuidMinecraft: uuidMinecraft,
                        pseudoMinecraft: pseudoMinecraft
                    });

                    console.log(`Discord Tag : ${discordTag}`);
                    console.log(`UUID Minecraft : ${uuidMinecraft}`);
                    console.log(`Pseudo Minecraft : ${pseudoMinecraft}`);
                    console.log('---------------------------');
                }
                const embed = new EmbedBuilder()
                    .setTitle('Liste des joueurs enregistrés')
                    .setColor('#0099ff')  // Vous pouvez changer la couleur selon vos préférences
                    .setDescription('Voici la liste des joueurs enregistrés avec leur tag Discord et UUID Minecraft:')
                    .addFields(
                        // Ajouter un champ pour chaque joueur dans la liste
                        ...playerList.map(player => ({
                            name: `Discord Tag : ${player.discordTag}`,
                            value: `UUID Minecraft : ${player.uuidMinecraft} \n Pseudo Minecraft : ${player.pseudoMinecraft}`,
                            inline: false
                        }))
                    );


                // Répondre à l'interaction avec l'embed
                await interaction.followUp({ embeds: [embed] });
            } else {
                console.log('Aucun résultat trouvé.');
                await interaction.reply('Aucun joueur enregistré trouvé.');
            }
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Une erreur est survenue lors de la récupération des données.', ephemeral: true });
        }
    }
};

/*
async function getPseudoFromUUID(uuid) {
    // Construire l'URL de l'API Mojang
    const apiUrl = `https://api.minetools.eu/uuid/${uuid}`;

    try {
        // Faire une requête HTTP pour obtenir les informations du joueur
        const response = await fetch(apiUrl);

        if (!response.ok) {
            console.error(`La requête API Mojang a échoué avec le statut : ${response.status}`);
            return null;
        }

        const data = await response.json();

        if (data.hasOwnProperty('name')) {
            const pseudo = data.name;
            console.log(`Le pseudo du joueur avec l'UUID ${uuid} est : ${pseudo}`);
            return pseudo;
        } else {
            console.error(`Aucun pseudo trouvé pour l'UUID ${uuid}`);
            return null;
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des informations du joueur :', error);
        return null;
    }
}
*/