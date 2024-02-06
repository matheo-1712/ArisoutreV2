const { Events, EmbedBuilder, userMention, roleMention } = require('discord.js');
const { bot, serv_antre } = require('../config.json');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        try {
            const guild = member.guild; // Use member.guild instead of client.guilds.cache

            if (!guild) {
                console.error("Le serveur n'a pas été trouvé. Vérifiez la configuration.");
                return;
            }

            const welcomeChannel = guild.channels.cache.get(serv_antre.channelBienvenue);

            if (!welcomeChannel) {
                console.error("Le canal de bienvenue n'a pas été trouvé. Vérifiez la configuration.");
                return;
            }

            const userPing = userMention(member.user.id);
            const rolePing = roleMention(serv_antre.roleBienvenue);

            console.log(`L'utilisateur ${member.user.tag} a rejoint le serveur.`);

            welcomeChannel.send(userPing + ` merci de lire, c'est important :`);

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: "L'antre des Loutres",
                })
                .setTitle("Premièrement bienvenue à toi !")
                .setURL("https://www.youtube.com/watch?v=rEq1Z0bjdwc")
                .setDescription("N'aie pas peur simplement parce que tu ne vois pas beaucoup de messages ici dans <#1112788602909372496>.\n\nCe serveur Discord est dédié aux jeux, donc les salons principalement utilisés sont <#1159113861593579612>, <#1112784827649904732>, <#1112792016246554776>, et parfois <#1112790796119326812> pour le reste des jeux.\n\nIl est possible qu'après t'être baladé, cela te semble encore un peu vide à ton goût, mais il faut te rappeler que nous essayons de nous développer et que nous avons besoin de toi pour cela ! :index_pointing_at_the_viewer:\n\nN'oublie pas que notre petite communauté nous permet toujours d'avoir une bonne ambiance, alors reste un peu avant de te faire un avis :otter:\n\nOse lancer des discussions, tu verras bien que nous sommes présents !")
                .setThumbnail("https://cdn.discordapp.com/attachments/640874969227722752/1173553276801781820/opt__aboutcom__coeus__resources__content_migration__mnn__images__2015__09__river-otters-lead-photo-86eef01e35714da9a6dd974f321e3504.jpg")
                .setColor("#00b0f4");
            welcomeChannel.send({ embeds: [embed] });

            welcomeChannel.send(rolePing + ` merci de bien l'accueillir et de l'orienter au nécessaire !`);
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message de bienvenue :', error);
        }
    },
};
