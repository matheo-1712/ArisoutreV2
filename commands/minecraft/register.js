const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
const { getUUIDFromPseudo } = require('../../utils/minecraft/UUID');
const { sql, serv_antre } = require('../../config.json');

module.exports = {
    cooldown: 60,
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription(`Enregistre ton compte Minecraft par rapport à ton compte Discord`)
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('pseudo')
                .setDescription('Votre pseudonyme Minecraft.')
                .setRequired(true)),
    async execute(interaction) {
        try {
            // Récupération de l'ID Discord et du tag utilisateur
            const discordUserId = interaction.user.id;
            const discordUserTag = interaction.user.tag;
            const pseudo = interaction.options.getString('pseudo');

            // Répondre à l'interaction pour indiquer que l'enregistrement est en cours
            const replyMessage = await interaction.reply({ content: `Enregistrement de l'UUID de votre compte : ${pseudo} en cours...`, ephemeral: false });

            // Vérification que l'utilisateur n'est pas déjà enregistré
            const connectionCheck = await mysql.createConnection({
                host: sql.host,
                user: sql.user,
                password: sql.password,
                database: sql.database,
            });

            try {
                // Préparation de la requête SQL
                const queryCheck = 'SELECT * FROM mc_link_discord WHERE id_discord = ?';
                const [rows, fields] = await connectionCheck.execute(queryCheck, [discordUserId]);

                if (rows.length > 0) {
                    await replyMessage.edit({ content: 'Vous êtes déjà enregistré !', ephemeral: false });
                    console.log(`L'utilisateur ${discordUserTag} a tenté de s'enregistrer mais il est déjà enregistré.`);
                    return;
                }
            } catch (error) {
                console.error(`Erreur lors de la vérification de l'enregistrement : ${error.message}`);
                await replyMessage.edit({ content: "Une erreur s'est produite lors de la vérification de l'enregistrement.", ephemeral: false });
                return;
            } finally {
                await connectionCheck.end();
            }

            let connectionRegister;
            try {
                const UUID = await getUUIDFromPseudo(pseudo);
                try {
                    if (!UUID) {
                        throw new Error("Une erreur s'est produite lors de la récupération de l'UUID.");
                    }
                } catch (error) {
                    console.error(`Erreur lors de la récupération de l'UUID : ${error.message}`);
                    await replyMessage.edit({ content: error.message, ephemeral: false });
                    return;
                }

                // Enregistrement de l'UUID
                connectionRegister = await mysql.createConnection({
                    host: sql.host,
                    user: sql.user,
                    password: sql.password,
                    database: sql.database,
                });

                const queryRegister = 'INSERT INTO mc_link_discord (id_discord, uuid_minecraft) VALUES (?, ?)';
                const [results, fields] = await connectionRegister.execute(queryRegister, [discordUserId, UUID]);

                if (results.affectedRows === 0) {
                    throw new Error("Une erreur s'est produite lors de l'enregistrement de l'UUID.");
                }

                // Ajout du rôle 
                const member = await interaction.guild.members.fetch(discordUserId);
                const roleToAdd = await interaction.guild.roles.fetch(serv_antre.roleMcEnregistre);

                if (roleToAdd) {
                    await member.roles.add(roleToAdd);
                    console.log(`Ajout du rôle ${serv_antre.roleMcEnregistre} à ${discordUserTag}`);
                } else {
                    console.error(`Le rôle avec l'ID ${serv_antre.roleMcEnregistre} n'a pas été trouvé.`);
                }

                // Répondre à l'interaction pour indiquer que l'UUID a bien été enregistré
                await replyMessage.edit({ content: `${discordUserTag}, L'UUID de votre compte : ${pseudo} a bien été enregistré !`, ephemeral: false });
            } catch (error) {
                console.error(`Erreur lors de l'enregistrement de l'UUID : ${error.message}`);
                await replyMessage.edit({ content: error.message, ephemeral: true });
            } finally {
                if (connectionRegister) {
                    await connectionRegister.end();
                }
            }
        } catch (error) {
            console.error(`Erreur lors de l'exécution de la commande : ${error.message}`);
            // Handle other errors as needed
        }
    }
};
