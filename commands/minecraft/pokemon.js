const { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const { recupPokeDataParUUID } = require('../../utils/minecraft/dataPixelmon');
const { getUUIDFromDiscordId, getPseudoFromUUID } = require('../../utils/minecraft/UUID');
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

        // Vérification de la présence de données
        if (!ndexList) {
            await interaction.reply({ content: 'Une erreur s\'est produite lors de la récupération des données.', ephemeral: true });
            return;
        }

        // Construction du message
        let message = `Voici les Pokemon de votre équipe PixelFrost :`;

        // Construction de l'image
        const canvas = createCanvas(1920, 1080);
        const ctx = canvas.getContext('2d');
        const background = await loadImage('./ressources/img/pokemon/card/default-card.png');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        registerFont('./ressources/police/minecraftia/minecraftia.ttf', { family: 'Minecraftia' });

        // Mettre la tête Minecraft de l'utilisateur centrée par rapport à un point spécifique
        const avatarURL = `https://mc-heads.net/body/${UUID}`;
        const avatar = await loadImage(avatarURL);
        const avatarSizeX = 215;
        const avatarSizeY = 500;
        const centerX = 275; // Coordonnée X du centre du canevas
        const centerY = 565; // Coordonnée Y du centre du canevas

        // Calculer les coordonnées de l'image pour la centrer par rapport au point spécifique
        const avatarX = centerX - avatarSizeX / 2; // Coordonnée X pour centrer horizontalement
        const avatarY = centerY - avatarSizeY / 2; // Coordonnée Y pour centrer verticalement

        ctx.drawImage(avatar, avatarX, avatarY, avatarSizeX, avatarSizeY);


        // Mettre le pseudo du joueur en bas a gauche
        const pseudo = await getPseudoFromUUID(UUID);
        if (!pseudo) {
            await interaction.reply({ content: 'Une erreur s\'est produite lors de la récupération du pseudo.', ephemeral: true });
            return;
        }
        if (pseudo.length > 10) {
            ctx.font = '32px "Minecraftia"';
        } else {
            ctx.font = '40px "Minecraftia"';
        }
        const pseudoX = 272;
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(pseudo, pseudoX, 950);

        // Définir les paramètres communs des Pokémon
        const pokemonSize = 250;
        const startY = [100, 570];
        const startX = [510, 835, 1175]; // Ajoutez d'autres valeurs si nécessaire

        // Boucle pour charger et dessiner les Pokémon
        for (let i = 0; i < Math.min(ndexList.length, startY.length * startX.length); i++) {
            const rowIndex = Math.floor(i / startX.length);
            const colIndex = i % startX.length;

            // Récupérer le numéro du Pokémon
            let pokemonSprites = ndexList[i].ndex;

            // Récupérer si il y a un caractère shiny
            const shiny = ndexList[i].shiny;

            if (shiny) {
                pokemonSprites = pokemonSprites + "_shiny";
            }

            // Récupérer l'objet tenu par le Pokémon
            const objet = ndexList[i].objet;

            if (objet.includes('ite')) {
                if (objet.includes('y')) {
                pokemonSprites = pokemonSprites + "_form2";
                } else {
                    pokemonSprites = pokemonSprites + "_form1";
                }
            }

            // Résoudre le chemin absolu de l'image
            const imagePath = path.resolve(`/home/arisu/Arisoutre/ressources/img/pokemon/sprites/${pokemonSprites}.png`);

            try {
                // Vérifier si le fichier existe
                await fs.access(imagePath);
            } catch (error) {
                // Si le fichier n'existe pas, utiliser le nom alternatif
                console.log(`L'image ${imagePath} n'existe pas. Utilisation de l'image de remplacement.`);
                pokemonSprites = pokemonSprites + "_F"; // Remplacer le numéro du Pokémon par le nom alternatif
            }

            // Charger l'image à partir du chemin absolu (utilisant le nom alternatif si nécessaire)
            const pokemon = await loadImage(path.resolve(`/home/arisu/Arisoutre/ressources/img/pokemon/sprites/${pokemonSprites}.png`));

            // Dessiner l'image du Pokémon
            ctx.drawImage(pokemon, startX[colIndex], startY[rowIndex], pokemonSize, pokemonSize);

            // Ajouter le nickname du Pokémon avec un décalage vers le bas
            ctx.font = '30px "Minecraftia"';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            const offsetY = 110; // Décalage vers le bas
            ctx.fillText(ndexList[i].nickname, startX[colIndex] + pokemonSize / 2, startY[rowIndex] + pokemonSize + 20 + offsetY);
        }
        // Envoi de l'image
        const attachment = new AttachmentBuilder(canvas.toBuffer(), 'image.png');

        // Envoi de la réponse
        await interaction.reply({ content: message, files: [attachment], ephemeral: false });
    }
};
