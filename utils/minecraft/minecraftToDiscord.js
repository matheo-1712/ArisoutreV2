// Minecraft vers Discord
const { createConnection } = require('mysql2/promise');
const fs = require('node:fs');
const path = require('node:path');
const Tail = require('tail');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const { serv_antre, sql } = require('../../config.json');

// Déclaration des variables globales
let tail; // Déclaration de tail en dehors de la fonction
let chatMessageRegex; // Expression régulière pour extraire le message du joueur

async function minecraftToDiscord(client) {
    const discordChannelId = serv_antre.channelMc;
    const logChannelIdArisu = serv_antre.channelArisoutreLogs;

    // Regex pour le message de lancement du serveur
    const regex_done = /Done \([\d.]+\w*\)! For help, type "help"/;

    // Regex pour un joueur qui rejoins le serveur
    const regex_join = /(\w+) joined the game/;

    // Regex pour un joueur qui quitte le serveur
    const regex_leave = /(\w+) left the game/;

    try {
        // Nouvelle façon de définir le chemin du fichier server.json
        const newServerJsonPath = path.join(__dirname, '../../../Arisoutre/triggers/serverActuel.json');

        // Vérifier si le fichier server.json existe avant de le lire
        if (fs.existsSync(newServerJsonPath)) {
            const { server: serverActuel } = JSON.parse(fs.readFileSync(newServerJsonPath, 'utf8'));

            const connection = await createConnection({
                host: sql.host,
                user: sql.user,
                password: sql.password,
                database: sql.database,
            });

            // Utiliser l'id du canal directement plutôt que de récupérer l'objet canal à chaque itération
            const channelMc = client.channels.cache.get(discordChannelId);
            const logChannel = client.channels.cache.get(logChannelIdArisu);

            try {
                const [rows] = await connection.execute('SELECT path_serv, embedColor FROM infos_serv WHERE nom_serv = ?', [serverActuel]);

                console.log('Résultats de la requête SQL:', rows);

                if (rows && rows.length > 0 && rows[0].path_serv) {
                    const embedImage = rows[0].embedImage;
                    const serverPath = rows[0].path_serv;
                    const embedColor = rows[0].embedColor;
                    const caption = rows[0].caption;
                    const logFilePath = path.join(serverPath, 'logs/latest.log');

                    console.log('Chemin du fichier de logs:', logFilePath);

                    // Si tail existe, arrête la surveillance du fichier existant
                    if (tail) {
                        tail.unwatch();
                    }

                    // Initialisation de tail avec le nouveau chemin du fichier de logs
                    tail = new Tail.Tail(logFilePath);

                    tail.on('line', async (line) => {
                        // Envoyer le message de log dans le canal Discord
                        logChannel.send(line);

                        // Extraire le message du joueur
                        if (serverActuel === 'Pixelfrost') {
                            chatMessageRegex = /^\[(\d{2}[a-zA-Z]{3}\d{4} \d{2}:\d{2}:\d{2}\.\d{3})\] \[Server thread\/INFO\] \[net.minecraft.server.dedicated.DedicatedServer\/\]: <(\w+)> (.+)$/;
                        } else {
                            chatMessageRegex = /^\[(\d{2}:\d{2}:\d{2})\] \[Server thread\/INFO\]: <(\w+)> (.+)$/;
                        }

                        // Extraire le message du joueur
                        const match = line.match(chatMessageRegex);

                        // Extraire le message de lancement du serveur
                        const match_done = line.match(regex_done);

                        // Extraire un achivement que reçoit un joueur
                        const match_achivement = line.match(/(\w+) has made the advancement \[(.+)\]/);

                        // Extraire le pseudo du joueur qui rejoint le serveur
                        const match_join = line.match(regex_join);

                        // Extraire le pseudo du joueur qui quitte le serveur
                        const match_leave = line.match(regex_leave);


                        if (match) {
                            const pseudo = match[2];
                            const contenuMessage = match[3];
                            const formattedMessage = `${contenuMessage}`;

                            // Remplacer @here et @everyone par du texte neutre
                            const messageProtect = formattedMessage.replace(/@here/g, '@\u200Bhere').replace(/@everyone/g, '@\u200Beveryone');

                            console.log('Message de chat détecté:', messageProtect);

                            const footerText = `Message provenant de : ${serverActuel}`;

                            try {
                                // Appel à l'API Mojang pour obtenir le UUID du joueur
                                const apiUrl = `https://api.mojang.com/users/profiles/minecraft/${pseudo}`;
                                const response = await axios.get(apiUrl);

                                // Vérifier si la réponse est valide et contient un ID
                                if (response.data && response.data.id) {
                                    const playerUUID = response.data.id;

                                    // Générer le lien vers la tête du skin
                                    headUrl = `https://mc-heads.net/avatar/${playerUUID}/50`;

                                } else {
                                    console.error('Réponse invalide de l\'API Mojang:', response.data);
                                    return null;  // Ou lancez une exception selon votre logique de gestion des erreurs
                                }
                            } catch (error) {
                                console.error('Erreur lors de la récupération du skin du joueur:', error.message);
                                return null;  // Ou lancez une exception selon votre logique de gestion des erreurs
                            }

                            if (channelMc) {
                                const embed = new EmbedBuilder()
                                    .setAuthor({
                                        name: `${pseudo}`,
                                        url: `https://fr.namemc.com/profile/${pseudo}`,
                                    })
                                    .setThumbnail(headUrl)
                                    .setDescription(messageProtect)
                                    .setColor(embedColor)
                                    .setTimestamp()
                                    .setFooter({
                                        text: footerText,
                                    });

                                channelMc.send({ embeds: [embed] });
                            } else {
                                console.error('Le canal Discord n\'existe pas ou n\'est pas de type texte.');
                            }
                        } else if (match_done) {
                            if (channelMc) {
                                const embed = new EmbedBuilder()
                                    .setTitle('Serveur Minecraft lancé')
                                    .setImage(embedImage)
                                    .setColor(embedColor)
                                    .setTimestamp()
                                    .setFooter({ text: 'Arisu' });

                                channelMc.send({ embeds: [embed] });
                            }
                        } else if (match_achivement) {
                            const pseudo = match_achivement[1];
                            const achivement = match_achivement[2];
                            if (channelMc) {
                                const embed = new EmbedBuilder()
                                    .setTitle(`${pseudo} a obtenu un succès`)
                                    .setDescription(achivement)
                                    .setColor(embedColor)
                                    .setTimestamp()
                                    .setFooter({ text: 'Arisu' });

                                channelMc.send({ embeds: [embed] });
                            }
                        } else if (match_join) {
                            const pseudo = match_join[1];
                            if (channelMc) {
                                const embed = new EmbedBuilder()
                                    .setTitle(`${pseudo} a rejoint le serveur`)
                                    .setColor(embedColor)
                                    .setTimestamp()
                                    .setFooter({ text: 'Arisu' });

                                channelMc.send({ embeds: [embed] });
                            }
                        } else if (match_leave) {
                            const pseudo = regex_leave.exec(line)[1];
                            if (channelMc) {
                                const embed = new EmbedBuilder()
                                    .setTitle(`${pseudo} a quitté le serveur`)
                                    .setColor(embedColor)
                                    .setTimestamp()
                                    .setFooter({ text: 'Arisu' });

                                channelMc.send({ embeds: [embed] });
                            }
                        }
                    });

                    tail.on('error', (error) => {
                        console.error('Erreur de lecture du fichier log :', error);
                    });

                    // Envoyer le message de log après la boucle forEach
                    const logChannel = client.channels.cache.get(logChannelIdArisu);
                    if (logChannel) {
                        tail.on('change', () => {
                            logChannel.send(`Le fichier latest.log a été modifié`);
                        });
                    } else {
                        console.error('Le canal de logs Discord n\'existe pas ou n\'est pas de type texte.');
                    }
                } else {
                    console.error('Aucun résultat trouvé pour la requête SQL ou propriété path_serv non définie.');
                }
            } catch (error) {
                console.error('Erreur lors de la récupération du chemin du serveur:', error);
            } finally {
                await connection.end();
            }
        } else {
            console.error('Le fichier server.json n\'existe pas.');
        }
    } catch (error) {
        console.error('Erreur lors de la lecture du fichier server.json:', error);
    }
}

module.exports = {
    minecraftToDiscord,
};
