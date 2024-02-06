const { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage, registerFont } = require('canvas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('genimg')
        .setDescription('Test la génération d\'une image.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),
    async execute(interaction) {
        try {
            // Récupération du contexte du message
            const { channel, user } = interaction;

            // Chargement de la police si nécessaire
            registerFont('./ressources/police/utendo/Utendo-Black.ttf', { family: 'Utendo' });

            // Création d'un canvas
            const canvas = createCanvas(800, 400);
            const ctx = canvas.getContext('2d');

            // FOND
            const background = await loadImage('./ressources/img/bienvenue.png');
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

            // AVATAR DE L'UTILISATEUR DISCORD
            let avatarURL = user.displayAvatarURL({ format: 'png' });
            // Remplacer l'extension webp par png
            avatarURL = avatarURL.replace(/\.webp$/, '.png');
            
            // Charger l'avatar avec l'URL modifiée
            const avatar = await loadImage(avatarURL);

            // Dessiner l'avatar sur le canvas
            ctx.drawImage(avatar, 250, 250, 100, 100); // Position et taille de l'avatar sur le canvas

            // Tête Minecraft de Steve
            const externalImage = await loadImage('https://mc-heads.net/avatar/MHF_Steve'); // Exemple d'URL d'une image

            // Utilisation de la police dans le reste du code
            ctx.font = '48px Utendo';
            ctx.fillText('Bouh', 50, 50);

            // Dessiner l'image externe sur le canvas
            ctx.drawImage(externalImage, 100, 50, 50, 50); // Position et taille de l'image externe sur le canvas

            // Envoi de l'image dans le canal de bienvenue
            const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'bienvenue.png' });
            interaction.reply({ content: "Image générée avec succès !", ephemeral: true });
            channel.send({ files: [attachment] });
        } catch (error) {
            console.error(`Une erreur s'est produite lors de la génération de l'image : ${error.message}`);
            interaction.reply({ content: "Une erreur s'est produite lors de la génération de l'image.", ephemeral: true });
        }
    }
};
