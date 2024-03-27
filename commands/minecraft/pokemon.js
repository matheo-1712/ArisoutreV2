const { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const { recupPokeDataParUUID } = require('../../utils/minecraft/dataPixelmon');
const { getUUIDFromDiscordId } = require('../../utils/minecraft/UUID');
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs').promises;

module.exports = {
    cooldown: 60,
    data: new SlashCommandBuilder()
        .setName('pokemon')
        .setDescription(`Affiche les numéros du Pokédex des Pokémon de l'utilisateur`)
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false)
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Membre du serveur')
                .setRequired(false)),
    async execute(interaction) {

        // Récupère le membre
        const member = interaction.options.getMember('membre');

        // Initialisation de l'identifiant Discord
        let discordUserId;

        if (member) {
            // Si le membre est fourni en tant qu'option dans l'interaction
            discordUserId = member.user.id;
            console.log(discordUserId);
        } else {
            // Si aucun membre n'est fourni en tant qu'option dans l'interaction, récupère l'utilisateur de l'interaction
            discordUserId = interaction.user.id;
            console.log(discordUserId);
        }


        // Récupération de l'UUID de l'utilisateur
        const UUID = await getUUIDFromDiscordId(discordUserId);

        // Vérification de la présence de l'UUID
        if (!UUID) {
            await interaction.reply({ content: "Ce compte ne possède pas d'enregistrement d'UUID. Merci de l'enregister via la commande ```/register {pseudo_minecraft}```", ephemeral: true });
            return;
        }
        console.log(UUID);

        // Récupération des données du pokémon
        const ndexList = await recupPokeDataParUUID(UUID);

        // Vérification de la présence de pokémon
        if (!ndexList) {
            await interaction.reply({ content: "Aucun Pokémon n'a été trouvé pour cet utilisateur. S'il vous plaît noter que si vous n'avez jamais joué à Pixelfrost, cela est normal. Sinon merci de contacter un administrateur.", ephemeral: true });
            return;
        }

        console.log('Liste des pokémons :', ndexList);

        // Vérification de la présence de données
        if (!ndexList) {
            await interaction.reply({ content: 'Une erreur s\'est produite lors de la récupération des données.', ephemeral: true });
            return;
        }

        // Construction du message
        let message = `Voici les Pokemon de votre équipe PixelFrost :`;

        // Construction de l'image
        const canvas = createCanvas(800, 400);
        const ctx = canvas.getContext('2d');
        const background = await loadImage('./ressources/img/bienvenue.png');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        registerFont('./ressources/police/utendo/Utendo-Black.ttf', { family: 'Utendo' });

        // Mettre la tête Minecraft de l'utilisateur en haut a gauche
        const avatarURL = `https://mc-heads.net/avatar/${UUID}`;
        const avatar = await loadImage(avatarURL);
        const avatarSize = 100;
        const avatarX = 15;
        const avatarY = 15;
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);

        // Définir les paramètres communs des Pokémon
        const pokemonSize = 100;
        const startY = [15, 150];
        const startX = [150, 300, 450, 600]; // Ajoutez d'autres valeurs si nécessaire

        // Boucle pour charger et dessiner les Pokémon
        for (let i = 0; i < Math.min(ndexList.length, startY.length * startX.length); i++) {
            const rowIndex = Math.floor(i / startX.length);
            const colIndex = i % startX.length;

            // Résoudre le chemin absolu de l'image
            const imagePath = path.resolve(`/home/arisu/Arisoutre/ressources/img/pokemon/sprites/${ndexList[i]}.png`);

            try {
                // Vérifier si le fichier existe
                await fs.access(imagePath);
            } catch (error) {
                // Si le fichier n'existe pas, utiliser le nom alternatif
                console.log(`L'image ${imagePath} n'existe pas. Utilisation de l'image de remplacement.`);
                ndexList[i] = ndexList[i] + "_F"; // Remplacer le nom de l'image
            }

            // Charger l'image à partir du chemin absolu (utilisant le nom alternatif si nécessaire)
            const pokemon = await loadImage(path.resolve(`/home/arisu/Arisoutre/ressources/img/pokemon/sprites/${ndexList[i]}.png`));

            // Dessiner l'image du Pokémon
            ctx.drawImage(pokemon, startX[colIndex], startY[rowIndex], pokemonSize, pokemonSize);
        }

        // Envoi de l'image
        const attachment = new AttachmentBuilder(canvas.toBuffer(), 'image.png');

        // Envoi de la réponse
        await interaction.reply({ content: message, files: [attachment], ephemeral: false });
    }
};
