const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const mysql = require('mysql2/promise');

const { sql } = require('../../config.json');

module.exports = {
    cooldown: 60,
    data: new SlashCommandBuilder()
        .setName('bot-message')
        .setDescription('Permet d\'envoyer un message en tant que bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Le message à envoyer')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Le channel où envoyer le message'))
        .addStringOption(option =>
            option.setName('ping')
                .setDescription('Si l\'on souhaite ping')
                .setRequired(false)
                .addChoices(
                    { name: 'Aucun', value: 'none'},
                    { name: 'Utilisateurs du serveur', value: 'server' },
                    { name: 'Tout le monde', value: 'all' },
                ))
        .addStringOption(option =>
            option.setName('serveur')
                .setDescription('Le serveur des joueurs à ping')
                .setRequired(false)
                .setAutocomplete(true)),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();

        try {
            const connection = await mysql.createConnection({
                host: sql.host,
                user: sql.user,
                password: sql.password,
                database: sql.database,
            });

            // SQL Query
            const query = 'SELECT nom_serv FROM infos_serv WHERE actif=true;';

            // Execute the query
            const [rows] = await connection.execute(query);

            // Close the connection
            await connection.end();

            // Extract values from the 'nom_serv' column of the result
            const choices = rows.map((row, index) => ({ name: row.nom_serv, value: row.nom_serv }));

            // Display information in the console
            // console.log(choices);

            // Filter choices based on the focused value
            const filtered = choices.filter(choice => choice.name.startsWith(focusedValue));

            // Respond to the interaction with the filtered choices
            await interaction.respond(filtered.map(choice => ({ name: choice.name, value: choice.value })));
        } catch (error) {
            console.error(error);
            // Handle the error appropriately, e.g., send an error message to the user
            await interaction.reply("An error occurred while processing your request.");
        }
    },

    async execute(interaction) {
        // Initialiser la variable messageRecup
        let messageRecup;

        // Récupérer la commande
        const message = interaction.options.getString('message');

        // Récupérer le channel
        const channel = interaction.options.getChannel('channel');

        // Récupérer le ping
        const ping = interaction.options.getString('ping');

        // Ajouter les choix dynamiques
        const serveurOption = interaction.options.getString('serveur');

        if (ping === 'all') {
            // Envoyer le message
            messageRecup = message + '\n @everyone ';
        }
        else if (ping === 'none') {
            // Envoyer le message
            messageRecup = message;

        } else if (ping === 'server' && serveurOption) {
            let connection; // Variable de connexion à la base de données

            try {
                // Récupérer les utilisateurs du serveur
                connection = await mysql.createConnection({
                    host: sql.host,
                    user: sql.user,
                    password: sql.password,
                    database: sql.database,
                });

                // Récupération de l'id du serveur
                const id_server_query = 'SELECT id_serv FROM infos_serv WHERE nom_serv = ?';
                const [id_server_rows] = await connection.execute(id_server_query, [serveurOption]);
                console.log(`Id du serveur demandé dans le message : ${id_server_rows[0].id_serv} qui est ${serveurOption} `);

                if (id_server_rows.length > 0) {
                    const id_server = id_server_rows[0].id_serv;

                    // SQL Query pour récupérer les uuids des utilisateurs du serveur
                    const uuidQuery = 'SELECT uuid_minecraft FROM stats_serv WHERE id_serv = ?';
                    const [pingUserRows] = await connection.execute(uuidQuery, [id_server]);

                    // Extraire les valeurs de la colonne 'uuid_minecraft' du résultat
                    const uuids = pingUserRows.map(row => ({ uuid: row.uuid_minecraft }));
                    // console.log(`Variable uuids : ${JSON.stringify(uuids)}`); // Utilisation de JSON.stringify pour afficher l'objet

                    // Récupérer les pseudos discord par rapport aux uuid
                    const id_uuid_to_discord_query = 'SELECT id_discord FROM mc_link_discord WHERE uuid_minecraft = ?';
                    const id_discord_results = [];

                    // Pour chaque uuid, récupérer l'id_discord
                    for (const uuidObject of uuids) {
                        const [id_uuid_to_discord_row] = await connection.execute(id_uuid_to_discord_query, [uuidObject.uuid]);

                        if (id_uuid_to_discord_row.length > 0) {
                            id_discord_results.push(id_uuid_to_discord_row[0].id_discord);
                        }
                    }

                    // Extraire les valeurs de la colonne 'id_discord' du résultat
                    const discordIds = id_discord_results;

                    // Créer une chaîne de mentions d'utilisateur Discord
                    let mentionString = '';

                    for (const discordId of discordIds) {
                        console.log(`Discord id concerné : ${discordId}`);

                        try {
                            // Utiliser client.users.fetch pour récupérer l'objet d'utilisateur
                            const fetchedUser = await interaction.client.users.fetch(discordId);

                            // Vérifier si l'utilisateur a été trouvé
                            if (fetchedUser) {
                                mentionString += fetchedUser.toString() + ' ';
                            } else {
                                console.error(`Utilisateur non trouvé pour l'ID : ${discordId}`);
                            }
                        } catch (error) {
                            console.error(`Erreur lors de la récupération de l'utilisateur : ${error.message}`);
                        }
                    }

                    // Utiliser la chaîne de mentions dans votre messageRecup
                    messageRecup = message + `\n ${mentionString}`;
                }
            } catch (error) {
                console.error(`Erreur lors de la connexion à la base de données : ${error.message}`);
            } finally {
                // Assurez-vous de fermer la connexion après utilisation
                if (connection) {
                    await connection.end();
                } else {
                    console.error(`Serveur non trouvé : ${serveurOption}`);
                    messageRecup = message;
                }

                // Envoyer le message
                await channel.send(messageRecup);

                // Répondre à l'interaction
                await interaction.reply({ content: 'Message envoyé.', ephemeral: true });
            }
        } else {
            // Gérer le cas où le type de ping n'est pas reconnu
            await interaction.reply({ content: 'Type de ping non reconnu.', ephemeral: true });
        }
    }
};
