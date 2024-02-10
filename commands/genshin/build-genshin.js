const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('build-genshin')
		.setDescription('Donne le build du personnage demandé.')
		.addStringOption(option =>
			option.setName('personnage')
				.setDescription('Le nom du personnage dont vous voulez obtenir le build.')
				.setRequired(true)
		),

	async execute(interaction) {

		// Répond à l'interaction initiale pour indiquer à Discord que le bot a reçu l'interaction.
		const reply = await interaction.reply('Traitement en cours...');

		// Utilise `options` pour obtenir le texte passé avec la commande.
		const userText = interaction.options.getString('personnage').toLowerCase();

		// Utilise interaction.followUp() pour envoyer le lien du build.
		await reply.edit(`https://keqingmains.com/q/${userText}-quickguide/`);

	},
};