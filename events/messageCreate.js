const { Events } = require('discord.js');
const { updateMessageCount } = require('../utils/arisoutre/compteurMessage');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        // Appeler la fonction pour mettre à jour le nombre de messages de cet utilisateur
        updateMessageCount(message.author.id);

        // Convertir le contenu du message en minuscules
        const contentLower = message.content.toLowerCase();

        if (contentLower.includes('coucou') || contentLower.includes('salut') || contentLower.includes('bonjour')) {
            // Votre code à exécuter si le message contient 'Coucou'
            message.react('👋');
        }

        if (contentLower.includes('qiqi')) {
            // Votre code à exécuter si le message contient 'Qiqi'
            message.react('😭');
        }

        if (contentLower.includes('minecraft')) {
            // Votre code à exécuter si le message contient 'minecraft'
            message.react('🦾');
        }

        if (contentLower.includes('quoi')) {
            // Votre code à exécuter si le message contient 'quoi'
            message.react('🤔');
        }

        if (contentLower.includes('flex') || contentLower.includes('vu')) {
            // Votre code à exécuter si le message contient 'flex'
            const vu = message.guild.emojis.cache.find(emoji => emoji.name === 'mot_vu');
            message.react(vu);
        }

        if (contentLower.includes('fdp') || contentLower.includes('tg') || contentLower.includes('ntm')) {
            // Votre code à exécuter si le message contient une insulte enregistrée
            const ratentifVnr = message.guild.emojis.cache.find(emoji => emoji.name === 'emoji_ratentifrage');
            message.react(ratentifVnr);

        }

        if (contentLower.includes('aime')) {
            // Votre code à exécuter si le message contient 'aime'
            message.react('❤️');
        }
    }
};
