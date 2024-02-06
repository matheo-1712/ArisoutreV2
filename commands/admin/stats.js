const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { majStats } = require('../../utils/minecraft/majStats');

module.exports = {
    cooldown: 60,
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription(`Récupère les statistiques du joueur et les enregistre dans la base de données SQL`)
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),
    async execute(interaction) {
        // Répondre à l'interaction avec un message de confirmation
        await interaction.reply({ content: 'Commande effectuée avec succès!', ephemeral: true });
        majStats();
    }
};