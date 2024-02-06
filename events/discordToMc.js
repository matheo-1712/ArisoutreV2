const { Rcon } = require('rcon-client');
const { Events } = require('discord.js');
const { serveur, serv_antre } = require('../config.json');

let rcon;

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        const discordChannelId = serv_antre.channelMc;
        const logChannelIdMC = serv_antre.channelMcLogs;

        if (message.channel.id === logChannelIdMC) {
            return; // Ignorer les messages provenant de MCM MY ADMIN
        }

        if (message.author.username === "Arisoutre" || message.content === "") {
            return; // Ignorer les messages de Arisoutre ou vides
        }

        if (message.channel.id !== discordChannelId) {
            return; // Ignorer les messages qui ne proviennent pas du canal spécifié
        }

        console.log('Le message provient du canal spécifié.');

        if (!rcon || rcon.ended) {
            // Si la connexion RCON n'existe pas ou a été interrompue, tentez de la rétablir
            const rconOptions = {
                host: serveur.host,
                port: serveur.port,
                password: serveur.rconPassword,
            };

            try {
                rcon = await Rcon.connect(rconOptions);
                console.log('Connexion au RCON établie.');
            } catch (error) {
                console.error('Erreur lors de la connexion au RCON:', error.message);
                return;
            }
        }

        // Ajout de cette attente pour s'assurer que la connexion RCON est prête
        await new Promise(resolve => setTimeout(resolve, 1000)); // Attendez 1 seconde (ajustez si nécessaire)

        console.log('Reçu de discord, retransmission sur minecraft: ', message.content);

        try {
            // Vérifiez à nouveau la validité de la connexion RCON avant chaque envoi de message
            if (!rcon || rcon.ended) {
                console.error('La connexion RCON est invalide. Impossible d\'envoyer le message.');
                return;
            }

            await rcon.send(`tellraw @a ["",{"text":"<${message.author.username}>","color":"#5865F2","hoverEvent":{"action":"show_text","contents":"Message envoyé depuis le discord de l'Antre des Loutres."}},{"text":" ${message.content}"}]`);
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message RCON:', error.message);
            // En cas d'erreur, vous pouvez choisir de définir rcon à null pour qu'il soit réinitialisé lors du prochain message
            rcon = null;
        }
    },
};
