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

            // Chargement des données
            const fs = require('fs');

            // Charger le contenu du fichier JSON
            const jsonData = fs.readFileSync('./ressources/data/discordStats.json', 'utf-8');

            // Analyser le contenu JSON en tant qu'objet JavaScript
            const data = JSON.parse(jsonData);

            // Fonction pour récupérer les données par ID Discord
            function getDataById(id) {
                // Parcourir chaque objet dans le tableau de données
                for (const entry of data) {
                    // Vérifier si l'ID Discord correspond
                    if (entry.idDiscord === id) {
                        return entry; // Retourner l'objet correspondant
                    }
                }
                return null; // Retourner null si aucune correspondance n'a été trouvée
            }

            // Chargement de l'avatar
            const { channel, user } = interaction;
            let avatarURL = user.displayAvatarURL({ format: 'png' });
            avatarURL = avatarURL.replace(/\.webp$/, '.png');
            const avatar = await loadImage(avatarURL);
            const nbMessages = getDataById(user.id).nbMessages;

            // Chargement de l'image externe
            const externalImage = await loadImage('https://mc-heads.net/avatar/MHF_Steve');

            // Chargement du fond
            const background = await loadImage('./ressources/img/bienvenue.png');

            // Chargement des polices d'écritures
            registerFont('./ressources/police/utendo/Utendo-Black.ttf', { family: 'Utendo' });

            // Création du canvas
            const canvas = createCanvas(800, 400);

            // Dessin sur le canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

            // Dessin de l'avatar avec un bord arrondi
            const avatarSize = 100;
            const avatarX = 15;
            const avatarY = 15;
            const borderRadius = 50; // La moitié de la taille de l'avatar
            ctx.save(); // Sauvegarde le contexte actuel
            ctx.beginPath();
            ctx.arc(avatarX + borderRadius, avatarY + borderRadius, borderRadius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip(); // Applique un masque circulaire à tout ce qui est dessiné ensuite
            ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
            ctx.restore(); // Restaure le contexte précédent sans le masque circulaire

            // ctx.drawImage(externalImage, 100, 50, 50, 50);
            ctx.fillStyle = 'white'; // Définit la couleur du texte
            ctx.font = '30px Arial'; // Définit la taille et la police du texte
            ctx.fillText(user.tag, 125, 60);

            // Définir les propriétés de la barre
            const barWidth = 10;
            const barHeight = canvas.height;
            const barX = canvas.width / 2 - barWidth / 2; // Position horizontale pour centrer la barre

            // Dessiner la barre
            ctx.fillStyle = 'white'; // Couleur de la barre
            ctx.fillRect(barX, 0, barWidth, barHeight); // Dessiner le rectangle

            // Définir les propriétés du texte
            const text = 'Informations sur le joueur :';
            const textX = barX + barWidth + 20; // Position horizontale du texte
            const textY = 50; // Position verticale du texte

            // Dessiner le texte à côté de la barre
            ctx.fillStyle = 'white'; // Couleur du texte
            ctx.font = '20px Arial'; // Taille et police du texte
            ctx.fillText(text, textX, textY); // Dessiner le texte

            // Définir les propriétés du texte
            const nbMessageText = `Nombre de message de l'utilisateur : ${nbMessages}`;
            const nbMessageY = 100; // Position verticale du texte

            // Dessiner le texte à côté de la barre
            ctx.fillStyle = 'white'; // Couleur du texte
            ctx.font = '15px Arial'; // Taille et police du texte
            ctx.fillText(nbMessageText, textX, nbMessageY); // Dessiner le texte

            // Envoi de l'image
            const attachment = new AttachmentBuilder(canvas.toBuffer(), 'image.png');
            await interaction.reply({ files: [attachment] });
        }
        catch (error) {
            console.error(`Une erreur s'est produite : ${error.message}`);
            interaction.reply({ content: "Une erreur s'est produite.", ephemeral: true });
        }
    }
};
