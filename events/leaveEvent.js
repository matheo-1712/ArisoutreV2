const { Events } = require('discord.js');
const { serv_antre } = require('../config.json');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        try {
            const guild = member.guild; // Use member.guild instead of client.guilds.cache

            if (!guild) {
                console.error("Le serveur n'a pas été trouvé. Vérifiez la configuration.");
                return;
            }

            const welcomeChannel = guild.channels.cache.get(serv_antre.channelBienvenue);

            if (!welcomeChannel) {
                console.error("Le canal de départ n'a pas été trouvé. Vérifiez la configuration.");
                return;
            }

            console.log(`L'utilisateur ${member.user.tag} a quitté le serveur.`);

            welcomeChannel.send(member.user.tag + ` a quitté le serveur.`);

        } catch (error) {
            console.error('Erreur lors de l\'envoi du message de départ :', error);
        }
    },
};

