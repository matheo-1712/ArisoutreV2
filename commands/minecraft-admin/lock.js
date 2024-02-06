const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const path = require('path');
const fs = require('fs/promises');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription(`Bloque ou débloque l'accès au switch de serveur.`)
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),
    async execute(interaction) {
        // Chemin vers le fichier de commutateur
        const switchFilePath = path.resolve(__dirname, '../../triggers/switch.json');

        try {
            // Lire le contenu actuel du fichier
            const switchServer = await fs.readFile(switchFilePath, 'utf8');

            // Convertir la chaîne en boolean (true si égal à 'true', sinon false)
            const switchServerBoolean = switchServer.trim().toLowerCase() === 'true';

            // Inverser la valeur
            const newSwitchServerBoolean = !switchServerBoolean;

            // Écrire la nouvelle valeur dans le fichier
            await fs.writeFile(switchFilePath, newSwitchServerBoolean.toString(), 'utf8');

            // Utiliser newSwitchServerBoolean comme boolean
            const replyContent = newSwitchServerBoolean
                ? 'Le switch de serveur est actif :white_check_mark: '
                : 'Le switch de serveur est bloqué :x: ';

            interaction.reply({ content: replyContent});

        } catch (error) {
            console.error('Erreur lors de la manipulation du fichier de commutateur :', error);
            interaction.reply({ content: 'Une erreur est survenue lors de la manipulation du fichier de commutateur.', ephemeral: true });
        }
    }
};
