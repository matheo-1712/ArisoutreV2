const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');
const nbt = require('nbt');
const { select_ } = require('../SQL.js');

async function pixelmonPath() {
    try {
        const result = await select_('infos_serv', ['path_serv'], ['id_serv = "10"']);
        return result[0].path_serv;
    }
    catch (error) {
        console.error('Erreur lors de la récupération du chemin du serveur Pixelmon :', error);
        return null;
    }
}

// Récupération des données du pokémon à partir de l'UUID et du JSON
async function recupPokeDataParUUID(uuid) {
    try {
        uuid = await formatUUID(uuid);

        const jsonPath = path.join(__dirname, '../../ressources/data/minecraft/pixelmon/', uuid + '.json');
        console.log('Chemin du fichier JSON de data', jsonPath);
        const jsonData = require(jsonPath);

        const parties = ['party0', 'party1', 'party2', 'party3', 'party4', 'party5'];
        const pokemonInstances = [];

        for (const party of parties) {
            console.log('Traitement de la party:', party);
            if (jsonData.value[party] && jsonData.value[party].value.ndex) {

                // Récupérer le ndex du Pokémon
                const ndex = jsonData.value[party].value.ndex.value;

                // Vérifier si le Pokémon est shiny
                const shiny = jsonData.value[party].value.palette.value === "shiny";

                // Récupération du nom de l'item tenu avec une valeur par défaut
                const objet = jsonData.value[party]?.value?.HeldItemStack?.value?.id?.value ?? "Aucun objet tenu";

                // Récupérer le nickname depuis les données JSON, avec une valeur par défaut si non disponible
                const nickname = jsonData?.value?.[party]?.value?.Nickname?.value ?? await (async () => {
                    try {
                        const response = await fetch(`https://tyradex.vercel.app/api/v1/pokemon/${ndex}`);
                        if (!response.ok) {
                            throw new Error(`Erreur lors de la requête à l'API: ${response.statusText}`);
                        }
                        const data = await response.json();
                        return data.name.fr;
                    } catch (error) {
                        console.error(`Une erreur s'est produite lors de la récupération du Pokémon n°${ndex}:`, error);
                        return `Pokémon n°${ndex}`;
                    }
                })();

                let pokeInstance = {
                    ndex: ndex.toString().padStart(4, '0'), // PadStart pour ajouter des zéros au début si nécessaire
                    shiny: shiny,
                    nickname: nickname,
                    objet: objet
                };

                pokemonInstances.push(pokeInstance); // Stocker l'instance du Pokémon dans le tableau
                console.log('Ndex trouvé dans la party:', ndex);
            } else {
                console.log('Pas de ndex trouvé dans la party:', party);
            }
        }

        console.log('Instances des Pokémon:', pokemonInstances);
        return pokemonInstances;
    } catch (error) {
        console.error('Erreur lors de la récupération des données du pokémon :', error);
        return null;
    }
}


// Fonction de format de l'uuid pour correspondre au nom des fichiers
async function formatUUID(uuid) {
    const uuidWithoutDashes = uuid.replace(/-/g, '');
    const formattedUUID = uuidWithoutDashes.replace(/(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})/, '$1-$2-$3-$4-$5');
    return formattedUUID;
}

async function pkDataToJson() {
    // Récupération des chemins
    const directoryPath = await pixelmonPath();
    const inDirectoryPath = path.join(directoryPath, 'world', 'data', 'pokemon');
    const outputDirectoryPath = path.join(__dirname, '../../ressources/data/minecraft/pixelmon/');

    // Lire le contenu du dossier
    fs.readdir(inDirectoryPath, (err, files) => {
        if (err) {
            throw err;
        }

        // Filtrer les fichiers .pk
        const pkFiles = files.filter(file => path.extname(file) === '.pk');

        // Traiter chaque fichier .pk
        pkFiles.forEach(file => {
            // Lire les données depuis le fichier
            fs.readFile(path.join(inDirectoryPath, file), (err, data) => { // Utilisation de inDirectoryPath pour construire le chemin absolu
                if (err) {
                    throw err;
                }

                // Analyser les données NBT
                nbt.parse(data, (error, parsedData) => {
                    if (error) {
                        throw error;
                    }

                    // Obtenir le nom du fichier sans l'extension
                    const fileWithoutExtension = path.parse(file).name;

                    // Ajouter l'extension .json
                    const jsonFile = fileWithoutExtension + '.json';

                    // Écrire les données dans le fichier .json
                    fs.writeFile(path.join(outputDirectoryPath, jsonFile), JSON.stringify(parsedData, null, 2), (err) => {
                        if (err) {
                            throw err;
                        }
                        console.log('Les données ont été écrites dans ' + jsonFile);
                    });
                });
            });
        });
    });
}

module.exports = { recupPokeDataParUUID, pkDataToJson };
