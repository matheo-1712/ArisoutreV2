const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Rcon } = require('rcon-client');
const { serveur, sql } = require('../../config.json');
const mysql = require('mysql2/promise');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Fonction pour récupérer le nombre de joueurs en ligne
const { nbJoueurs } = require('../../utils/minecraft/getNbJoueurs.js');

// Fonction pour voir si le serveur est en ligne
const { getServerIsOnline } = require('../../utils/minecraft/getServeurIsOnline.js');

// Fonction pour changer l'activité du bot
const { activityArisoutre } = require('../../utils/arisoutre/activity.js');

module.exports = {
    cooldown: 15,
    data: new SlashCommandBuilder()
        .setName('serveur')
        .setDescription('Toutes les interactions avec le serveur.')
        .addStringOption(option =>
            option.setName('interaction')
                .setDescription('L\'interaction à effectuer')
                .setRequired(true)
                .addChoices(
                    { name: 'Infos', value: 'infos' },
                    { name: 'Lancement', value: 'start' },
                    { name: 'Changement de version', value: 'switch' },
                    { name: 'Redémmarage', value: 'restart' },
                    { name: 'Joueurs en ligne', value: 'joueurs' }
                )
        )
        .addStringOption(option =>
            option.setName('version')
                .setDescription('La version souhaitée')
                .setRequired(false)
                .setAutocomplete(true)
        ),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();

        try {
            const connection = await mysql.createConnection({
                host: sql.host,
                user: sql.user,
                password: sql.password,
                database: sql.database,
            });

            // Définiton de la requête
            const query = 'SELECT nom_serv FROM infos_serv WHERE actif=true;';

            // Exécution de la requête
            const [rows] = await connection.execute(query);

            // Fermeture de la connexion
            await connection.end();

            // Extraire les choix de la requête
            const choices = rows.map((row, index) => ({ name: row.nom_serv, value: row.nom_serv }));

            // Filtrer les choix pour ceux qui commencent par la valeur ciblée
            const filtered = choices.filter(choice => choice.name.startsWith(focusedValue));

            // Répondre à l'interaction avec les choix filtrés
            await interaction.respond(filtered.map(choice => ({ name: choice.name, value: choice.value })));
        } catch (error) {
            console.error(error);
            // Répondre à l'interaction avec un message d'erreur
            await interaction.reply("An error occurred while processing your request.");
        }
    },

    async execute(interaction) {
        // Changer l'activité du bot
        activityArisoutre(interaction.client);

        // Récupération de l'interaction
        const interactionRecup = interaction.options.getString('interaction');

        // Récupération du nom du serveur
        const versionRecup = interaction.options.getString('version');
        
        // Logique de récupération des joueurs en ligne
        const playersOnline = await nbJoueurs();
        const serverOnlineStatus = await getServerIsOnline();

        // Lire le JSON pour voir si la version du serveur proposé est identique à celle déjà présente dans le fichier
        const serverFilePath = path.resolve(__dirname, '../../triggers/serverActuel.json');
        const serverData = fs.readFileSync(serverFilePath, 'utf8');

        // Lire le JSON pour voir si le switch de serveur est activé
        const switchFilePath = path.resolve(__dirname, '../../triggers/switch.json');
        const switchServer = fs.readFileSync(switchFilePath, 'utf8').trim();

        // Convertir la chaîne en boolean (true si égal à 'true', sinon false)
        const switchServerBoolean = switchServer.toLowerCase() === 'true';

        // console.log('Données du fichier JSON :', serverData);
        let serverChoisis, serverActuel;

        if (versionRecup === null) {
            serverChoisis = JSON.parse(serverData).server;
            serverActuel = serverChoisis;
        } else {
            serverChoisis = versionRecup;
            serverActuel = JSON.parse(serverData).server;
        }

        // Connexion à la base de données
        const connection = await mysql.createConnection({
            host: sql.host,
            user: sql.user,
            password: sql.password,
            database: sql.database,
        });

        // Récupération de l'id du serveur
        const id_server_query = 'SELECT * FROM infos_serv WHERE nom_serv = ?';
        const [id_server_rows] = await connection.execute(id_server_query, [serverChoisis]);

        if (id_server_rows.length > 0) {
            id_server_rows.forEach(row => {
                //console.log('Résultat de la requête :', row);
                //console.log('---------------------------');
            });

            const {
                embedColor,
                embedImage,
                modpack,
                modpack_url,
                caption,
                version_serv,
            } = id_server_rows[0];

            // Vérification de l'état du serveur
            let serverStatus, NbJoueurs;

            if (serverChoisis !== serverActuel) {
                serverStatus = 'Serveur non sélectionné';
                NbJoueurs = '';
            } else {

                // Vérification de l'état du serveur
                if (serverOnlineStatus) {
                    serverStatus = 'Le serveur est ouvert';
                    NbJoueurs = playersOnline;
                } else {
                    serverStatus = 'Le serveur est fermé';
                    NbJoueurs = 0;
                }
            }

            // Utilisez les variables serverStatus et NbJoueurs selon vos besoins
            console.log('Statut du serveur:', serverStatus);
            console.log('Nombre de joueurs en ligne:', NbJoueurs);

            if (interactionRecup === 'joueurs') {
                console.log('/mc-joueurs effectué');
                console.log('Pour ', serverChoisis, ', les paramètres de embed sont :');
                console.log('Couleur de embed:', embedColor);
                console.log('Image de embed:', embedImage);
                console.log('Caption:', caption);

                if (serverOnlineStatus) {
                    try {
                        const rcon = await Rcon.connect({
                            host: serveur.host,
                            port: serveur.port,
                            password: serveur.rconPassword,
                        });

                        // Envoyer la commande pour obtenir la liste des joueurs
                        const response = await rcon.send('list');

                        await rcon.send(`tellraw @a {"text":"Arisoutre : ${interaction.user.username} a regardé les joueurs en ligne, à votre place, j'aurais peur d'être stalké (et je vérifierais si ma porte est bien fermée).","color":"#D1D5DB"}`);

                        // Fermer la connexion RCON
                        await rcon.end();

                        // Analyser la réponse pour extraire les joueurs
                        const match = response.match(/(\d+) of a max of (\d+) players online: (.+)/);

                        if (match && match[3]) {
                            // Extraire la liste des joueurs
                            const playersList = match[3];
                            const embed = new EmbedBuilder()
                                .setTitle(`Liste des joueurs connectés sur ${serverChoisis}`)
                                .setDescription(`${playersList}\n\nVous pouvez discuter avec les joueurs en ligne sur <#1159113861593579612>.\n/mc-info pour plus d'informations sur le serveur.`)
                                .setColor(embedColor)
                                .setFooter({ text: 'Arisu', iconURL: caption })
                                .setTimestamp(new Date());

                            // Répondre à l'interaction initiale pour indiquer à Discord que le bot a reçu l'interaction.
                            await interaction.reply({ embeds: [embed] });
                        } else {
                            const embed = new EmbedBuilder()
                                .setTitle(`Liste des joueurs connectés sur : ${serverChoisis}.`)
                                .setDescription("Aucun joueur pour le moment.\n/mc-info pour plus d'informations sur le serveur.")
                                .setColor(parseInt(embedColor.substring(1), 16))
                                .setFooter({ text: 'Arisu', iconURL: caption })
                                .setTimestamp(new Date());

                            // Répondre à l'interaction initiale pour indiquer à Discord que le bot a reçu l'interaction.
                            await interaction.reply({ embeds: [embed] });
                        }
                    } catch (error) {
                        console.error('Erreur lors de la connexion RCON :', error);
                    }
                } else {
                    const embed = new EmbedBuilder()
                        .setTitle(`Impossible ; Le serveur ${serverChoisis} est fermé`)
                        .setDescription("Tu veux me faire bosser pour rien toi :eyes:, merci donc de la lancez avec la commande /serveur")
                        .setColor(parseInt(embedColor.substring(1), 16))
                        .setFooter({ text: 'Arisu', iconURL: caption })
                        .setTimestamp(new Date());

                    // Répondre à l'interaction initiale pour indiquer à Discord que le bot a reçu l'interaction.
                    await interaction.reply({ embeds: [embed] });
                }
            } else if (interactionRecup === 'infos') {
                const embed = new EmbedBuilder()
                    .setColor(embedColor)
                    .setTitle(`Informations du serveur Minecraft : ${serverChoisis}`)
                    .setImage(embedImage)
                    .setDescription('Adresse IP : antredesloutres.online')
                    .setThumbnail('https://thumb.canalplus.pro/http/unsafe/1920x1080/smart/creativemedia-image.canalplus.pro/content/0001/40/97e6a76d9788e3e0eea6fddbd68b4fb8b8d5cdda.jpeg')
                    .addFields(
                        { name: 'Modpack :', value: `[${modpack}](${modpack_url})`, inline: true, url: 'https://www.curseforge.com/minecraft/modpacks/prominence-forge' },
                        { name: 'Version :', value: `${version_serv}`, inline: true },
                        { name: 'Joueurs en ligne :', value: `${NbJoueurs} (${serverStatus})`, inline: true },
                        {
                            name: "Commandes d'intéractions ;",
                            value: "```\n• /serveur```",
                            inline: false,
                        },
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Arisu', iconURL: `${caption}` });
                console.log('/mc-infos effectué du serveur :', serverChoisis);
                await interaction.reply({ embeds: [embed] });
            } else if (playersOnline <= 0) {
                if (interactionRecup === 'switch') {
                    try {
                        if (switchServerBoolean) {
                            // Vérification de l'état du serveur
                            if (serverActuel === versionRecup) {
                                const embed = new EmbedBuilder()
                                    .setColor(embedColor)
                                    .setTitle(`Impossible ; Serveur ${serverActuel} déjà sélectionné`)
                                    .setDescription(`${serverActuel} est déjà sélectionné, tu veux me faire bosser pour rien toi :eyes:`)
                                    .setTimestamp()
                                    .setFooter({ text: 'Arisu', iconURL: `${caption}` });

                                await interaction.reply({ embeds: [embed] });
                            } else if (serverActuel !== versionRecup) {
                                // Met à jour la variable dans le fichier JSON
                                fs.writeFileSync(serverFilePath, JSON.stringify({ server: versionRecup }, null, 2), 'utf8');
                                const embed = new EmbedBuilder()
                                    .setColor(embedColor)
                                    .setTitle(`Passage du serveur ${serverActuel} à : ${versionRecup}`)
                                    .setDescription("Je préviendrai lorsque le serveur sera ouvert.")
                                    .setTimestamp()
                                    .setFooter({ text: 'Arisu', iconURL: `${caption}` });

                                try {
                                    // Envoie la commande au serveur avec sudo
                                    const sudoMDP = serveur.userPassword;
                                    const sudoCommand = `bash /home/minecraft/startserv.bash`;

                                    // Saisie du mot de passe
                                    const password = sudoMDP || await askPassword();

                                    // Exécute la commande avec sudo et le mot de passe
                                    exec(`echo '${password}' | sudo -S ${sudoCommand}`, (error, stdout, stderr) => {
                                        if (error) {
                                            console.error(`Erreur lors de l'exécution de la commande avec sudo : ${stderr}`);
                                            return;
                                        }
                                        console.log(`Commande exécutée avec succès : ${stdout}`);
                                    });
                                } catch (error) {
                                    console.error('Erreur lors de l\'envoi de la commande :', error);
                                }
                                // Envoyez l'embed comme réponse à l'interaction
                                await interaction.reply({ embeds: [embed] });
                            }
                        } else {
                            const embed = new EmbedBuilder()
                                .setColor(embedColor)
                                .setTitle(`Impossible ; Le switch de serveur est désactivé`)
                                .setDescription(`Merci de contacter un administrateur pour plus d'informations.`)
                                .setTimestamp()
                                .setFooter({ text: 'Arisu', iconURL: `${caption}` });

                            await interaction.reply({ embeds: [embed] });
                        }
                    } catch (error) {
                        console.error('Erreur lors de la récupération du chemin du serveur:', error);
                    }
                } else if (interactionRecup === 'start') {
                    if (!serverOnlineStatus) {
                        try {
                            // Envoie la commande au serveur avec sudo
                            const sudoMDP = serveur.userPassword;
                            const sudoCommand = `bash /home/minecraft/startserv.bash`;

                            // Saisie du mot de passe
                            const password = sudoMDP || await askPassword();

                            // Exécute la commande avec sudo et le mot de passe
                            exec(`echo '${password}' | sudo -S ${sudoCommand}`, (error, stdout, stderr) => {
                                if (error) {
                                    console.error(`Erreur lors de l'exécution de la commande avec sudo : ${stderr}`);
                                    return;
                                }
                                console.log(`Commande exécutée avec succès : ${stdout}`);
                            });
                        } catch (error) {
                            console.error('Erreur lors de l\'envoi de la commande :', error);
                        }

                        const embed = new EmbedBuilder()
                            .setColor(embedColor)
                            .setTitle(`Démarrage du serveur : ${serverChoisis}`)
                            .setDescription("Je préviendrai lorsque le serveur sera ouvert.")
                            .setTimestamp()
                            .setFooter({ text: 'Arisu', iconURL: `${caption}` });

                        await interaction.reply({ embeds: [embed] });
                    } else {
                        const embed = new EmbedBuilder()
                            .setColor(embedColor)
                            .setTitle(`Impossible ; Le serveur ${serverChoisis} est déjà ouvert`)
                            .setDescription("Tu veux me faire bosser pour rien toi :eyes:")
                            .setTimestamp()
                            .setFooter({ text: 'Arisu', iconURL: `${caption}` });

                        await interaction.reply({ embeds: [embed] });
                    }
                } else if (interactionRecup === 'restart') {
                    if (!serverOnlineStatus) {
                        const embed = new EmbedBuilder()
                            .setColor(embedColor)
                            .setTitle(`Impossible ; Le serveur ${serverChoisis} est déjà fermé`)
                            .setDescription("Tu veux me faire bosser pour rien toi :eyes:, merci donc de la lancer avec la commande /serveur")
                            .setTimestamp()
                            .setFooter({ text: 'Arisu', iconURL: `${caption}` });

                        await interaction.reply({ embeds: [embed] });
                    } else {
                        try {
                            // Envoie la commande au serveur avec sudo
                            const sudoMDP = serveur.userPassword;
                            const sudoCommand = `bash /home/minecraft/startserv.bash`;

                            // Saisie du mot de passe
                            const password = sudoMDP || await askPassword();

                            // Exécute la commande avec sudo et le mot de passe
                            exec(`echo '${password}' | sudo -S ${sudoCommand}`, (error, stdout, stderr) => {
                                if (error) {
                                    console.error(`Erreur lors de l'exécution de la commande avec sudo : ${stderr}`);
                                    return;
                                }
                                console.log(`Commande exécutée avec succès : ${stdout}`);
                            });

                            const embed = new EmbedBuilder()
                                .setColor(embedColor)
                                .setTitle(`Redémarrage du serveur : ${serverChoisis}`)
                                .setDescription("Je préviendrai lorsque le serveur sera ouvert.")
                                .setTimestamp()
                                .setFooter({ text: 'Arisu', iconURL: `${caption}` });

                            await interaction.reply({ embeds: [embed] });
                        } catch (error) {
                            console.error('Erreur lors de l\'envoi de la commande :', error);

                            const embed = new EmbedBuilder()
                                .setColor(embedColor)
                                .setTitle(`Erreur lors du redémarrage du serveur : ${serverChoisis}`)
                                .setDescription("Une erreur s'est produite lors du redémarrage du serveur.")
                                .setTimestamp()
                                .setFooter({ text: 'Arisu', iconURL: `${caption}` });

                            await interaction.reply({ embeds: [embed] });
                        }
                    }
                }
            } else {
                let description;
                if (switchServerBoolean) {
                    description = "Merci d'attendre que le serveur se vide.\nSi tu veux leur dire de dégager, passe par <#1159113861593579612>.";
                } else {
                    description = "Le switch de serveur est désactivé.";
                }
                const embed = new EmbedBuilder()
                    .setColor(embedColor)
                    .setTitle(`Impossible, ${playersOnline} en ligne`)
                    .setDescription(description)
                    .setTimestamp()
                    .setFooter({ text: 'Arisu', iconURL: `${caption}` });

                await interaction.reply({ embeds: [embed] });
            }
        }
    }
};

const readline = require('readline');

async function askPassword() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question('Saisissez le mot de passe sudo : ', password => {
            rl.close();
            resolve(password);
        });
    });
}
