const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    cooldown: 60,
    data: new SlashCommandBuilder()
        .setName('mp')
        .setDescription(`Fait écrire en mp Arisu`)
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Le message')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Membre du serveur')
                .setRequired(true))
                .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
                .setDMPermission(false),
    async execute(interaction) {
        
        try {

            // Récupère le message
            const message = interaction.options.getString('message');
            // Récupère le membre
            const member = interaction.options.getUser('membre');

            // Utilisez interaction.user.send pour envoyer un message privé à l'utilisateur
            await member.send(message);
            // Répondre à l'interaction pour éviter l'erreur
            await interaction.reply({ content: 'Message envoyé avec succès en message privé !', ephemeral: true });

        } catch (error) {

            // Répondre à l'interaction pour éviter l'erreur
            console.error('Erreur lors de l\'envoi du message privé :', error);
            
            // Répondre à l'interaction pour éviter l'erreur
            await interaction.reply({ content: 'Erreur lors de l\'envoi du message privé :\n```'+error+'```', ephemeral: true });
        
        }
    },
};
