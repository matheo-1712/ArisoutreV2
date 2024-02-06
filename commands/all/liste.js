const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const { select_ } = require('../../utils/SQL');

module.exports = {
    cooldown: 60,
    data: new SlashCommandBuilder()
        .setName('liste')
        .setDescription(`Affiche les informations par rapport à ton choix.`)
        .setDMPermission(true)
        .addStringOption((option) =>
            option.setName('choix')
                .setDescription('Choisissez une option')
                .setRequired(true)
                .addChoices(
                    { name: 'Serveur Minecraft', value: 'mc' }
                )
        ),
    async execute(interaction) {
        const choice = interaction.options.getString('choix');

        if (choice === 'mc') {
            try {
                const listeServeurPromise = select_('infos_serv', ['nom_serv'], ['actif = true']);
                const listeServeurObjects = await listeServeurPromise;

                const listeServeurNames = listeServeurObjects.map(serv => serv.nom_serv);
                
                console.log(listeServeurNames);

                const embed = new EmbedBuilder()
                    .setColor('DarkButNotBlack')
                    .addFields(
                        { name: 'Voici la liste des serveurs Minecraft :', value: listeServeurNames.join('\n') }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Arisoutre'});

                interaction.reply({ embeds: [embed], ephemeral: false });
            } catch (error) {
                console.error(`Erreur lors de la récupération de la liste des serveurs : ${error.message}`);
                interaction.reply({ content: 'Une erreur s\'est produite lors de la récupération de la liste des serveurs.', ephemeral: true });
            }
        }
    }
}
