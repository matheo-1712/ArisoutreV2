const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { Rcon } = require('rcon-client');
const { serveur } = require('../../config.json');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('mc-annonce-admin')
        .setDescription(`Annonce sur le serveur minecraft en tant qu'admin`)
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Le type de message')
                .setRequired(true)
                .addChoices(
                    { name: 'Title (écran)', value: 'title' },
                    { name: 'Tellraw (chat)', value: 'tellraw' },
                )
        )
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Le message à envoyer')
                .setRequired(true)
        ),
    async execute(interaction) {
        try {

            // Récupérer la commande
            const messageRecup = interaction.options.getString('message');

            // Gestion du type de message demandé

            // Si le type est title
            const titleFormatMessage = `title @a title {"text":"${messageRecup}","color":"#ff0003"}`

            // Si le type est tellraw
            const tellrawFormatMessage = `tellraw @a {"text":"Admin : ${messageRecup}","color":"#ff0003"}`

            // Gestion du choix du type de message

            const type = interaction.options.getString('type');

            let message;

            if (type === 'title') {
                message = titleFormatMessage;
            } else if (type === 'tellraw') {
                message = tellrawFormatMessage;
            } else {
                return interaction.reply({ content: 'Le type de message est invalide.', ephemeral: true });
            }
            
            const rcon = await Rcon.connect({
                host: serveur.host,
                port: serveur.port,
                password: serveur.rconPassword
            });
            // Envoyer la commande pour ajouter le joueur à la whitelist
            const response = await rcon.send(message);

            // Fermer la connexion RCON
            await rcon.end();

            // Répondre à l'interaction initiale pour indiquer à Discord que le bot a reçu l'interaction.
            console.log(`Le message a été envoyé par le RCON réussi ! ${response}`);
            return interaction.reply({ content: `Le message a été envoyé par le RCON réussi ! ${response}`, ephemeral: true });


        } catch (error) {

            // Répondre à l'interaction initiale pour indiquer à Discord que le bot a reçu l'interaction.
            console.error('Erreur RCON :', error);
            return interaction.reply({ content: 'Une erreur est survenue lors de l\'envoie de la commande.', ephemeral: true });

        }
    },
};