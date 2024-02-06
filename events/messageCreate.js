const { Events } = require('discord.js');
const { serv_antre } = require('../config.json');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        // Convertir le contenu du message en minuscules
        const contentLower = message.content.toLowerCase();

        if (contentLower.includes('coucou')) {
            // Votre code à exécuter si le message contient 'Coucou'
            message.react('👋');
        }

        if (contentLower.includes('qiqi')) {
            // Votre code à exécuter si le message contient 'Qiqi'
            message.react('😭');
        }

        if (contentLower.includes('minecraft')) {
            // Votre code à exécuter si le message contient 'minecraft'
            message.react('🦾')
        }        
    }
};
