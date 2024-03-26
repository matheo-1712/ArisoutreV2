const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { recupPokeDataParUUID } = require('../../utils/minecraft/dataPixelmon');
const { getUUIDFromDiscordId } = require('../../utils/minecraft/UUID');

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
        let message = `Voici les numéros du Pokédex des Pokémon que vous avez capturés :\n `;
        for (const ndex of ndexList) {
            message += `${ndex}, `;
        }


        // Répondre à l'interaction avec le message
        await interaction.reply({ content: message, ephemeral: true });
    }
};