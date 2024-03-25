const fs = require('fs');
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

module.exports = { pkDataToJson };
