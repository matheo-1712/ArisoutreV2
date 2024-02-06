const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { Rcon } = require('rcon-client');
const { serveur } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('commands')
        .setDescription(`Utilisation de commandes direct sur la console.`) 
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('commande')
                .setDescription('La commande')
                .setRequired(true)),
    async execute(interaction) {

        // Récupérer la commande
        const commands = interaction.options.getString('commande');
    
        // Se connecter au RCON
        try {
            const rcon = await Rcon.connect({
                host: serveur.host,
                port: serveur.port,
                password: serveur.rconPassword
            });

            // Envoyer la commande pour ajouter le joueur à la whitelist
            const response = await rcon.send(commands);
        
            // Fermer la connexion RCON
            await rcon.end();

            // Répondre à l'interaction initiale pour indiquer à Discord que le bot a reçu l'interaction.
            return interaction.reply({ content: `La commande ${commands} a été envoyé par le RCON : ${response}`});
        
        } catch (error) {

            // Répondre à l'interaction initiale pour indiquer à Discord que le bot a reçu l'interaction.
            console.error('Erreur RCON :', error);
            return interaction.reply({ content: 'Une erreur est survenue lors de l\'envoie de la commande.', ephemeral: true });

        }
    },
};