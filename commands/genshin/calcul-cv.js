const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('calcul-cv')
        .setDescription('Renvoie la crit value d\'un artefact.')
        .addNumberOption(option =>
            option.setName('tc')
                .setDescription('Le taux critique'))
        .addNumberOption(option =>
            option.setName('dc')
                .setDescription('Le dégât critique')),
    async execute(interaction) {

        const tc = interaction.options.getNumber('tc');
        const dc = interaction.options.getNumber('dc');
        let critValue = (tc * 2) + dc;

        // Classement des crit value
        if (critValue < 10) {
            await interaction.reply({ content: `La valeur critique de cet artefact est de ${critValue}. C'est (j'espère) un artefact pour un support.` });
        } else if (critValue < 20) {
            await interaction.reply({ content: `La valeur critique de cet artefact est de ${critValue}. C'est un artefact potable pouvant être utile.` });
        } else if (critValue < 30) {
            await interaction.reply({ content: `La valeur critique de cet artefact est de ${critValue}. C'est un artefact dans la moyenne.` });
        } else if (critValue < 40) {
            await interaction.reply({ content: `La valeur critique de cet artefact est de ${critValue}. C'est un bon artefact.` });
        } else if (critValue < 50) {
            await interaction.reply({ content: `La valeur critique de cet artefact est de ${critValue}. C'est un artefact très bon.` });
        } else if (critValue < 60) {
            await interaction.reply({ content: `La valeur critique de cet artefact est de ${critValue}. C'est un artefact excellent. C'est une licorne alors qu'elle n'existe pas.` });
        } else {
            await interaction.reply({ content: `La valeur critique de cet artefact est impossible, elle dépasse la limite. Merci de vérifier ton calcul.`, ephemeral: true });
        }        
    },
    };