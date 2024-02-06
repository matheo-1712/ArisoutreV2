const mysql = require('mysql2/promise');
const { sql } = require('../config.json');

async function select_(table, colonnes, conditions) {
    try {
        const connection = await mysql.createConnection({
            host: sql.host,
            user: sql.user,
            password: sql.password,
            database: sql.database,
        });

        // Requête SQL
        let query = `SELECT ${colonnes.join(',')} FROM ${table}`;
        if (conditions) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }
        query += ';';
        
        // Exécution de la requête
        const [rows] = await connection.execute(query);

        // Fermeture de la connexion
        await connection.end();

        return rows;
    } catch (error) {
        console.error('Erreur lors de la connexion à la base de données :', error);
        return [];
    }
}

async function insert_(table, colonnes, valeurs) {
    try {
        const connection = await mysql.createConnection({
            host: sql.host,
            user: sql.user,
            password: sql.password,
            database: sql.database,
        });

        // Requête SQL
        let query = `INSERT INTO ${table} (${colonnes.join(',')}) VALUES (${valeurs.join(',')});`;
        
        // Exécution de la requête
        const [rows] = await connection.execute(query);

        // Fermeture de la connexion
        await connection.end();

        return rows;
    } catch (error) {
        console.error('Erreur lors de la connexion à la base de données :', error);
        return [];
    }
}

async function update_(table, colonnes, valeurs, conditions) {
    try {
        const connection = await mysql.createConnection({
            host: sql.host,
            user: sql.user,
            password: sql.password,
            database: sql.database,
        });

        // Requête SQL
        let query = `UPDATE ${table} SET `;
        for (let i = 0; i < colonnes.length; i++) {
            query += `${colonnes[i]} = ${valeurs[i]}`;
            if (i < colonnes.length - 1) {
                query += ', ';
            }
        }
        if (conditions) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }
        query += ';';
        
        // Exécution de la requête
        const [rows] = await connection.execute(query);

        // Fermeture de la connexion
        await connection.end();

        return rows;
    } catch (error) {
        console.error('Erreur lors de la connexion à la base de données :', error);
        return [];
    }
}

async function delete_(table, conditions) {
    try {
        const connection = await mysql.createConnection({
            host: sql.host,
            user: sql.user,
            password: sql.password,
            database: sql.database,
        });

        // Requête SQL
        let query = `DELETE FROM ${table}`;
        if (conditions) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }
        query += ';';
        
        // Exécution de la requête
        const [rows] = await connection.execute(query);

        // Fermeture de la connexion
        await connection.end();

        return rows;
    } catch (error) {
        console.error('Erreur lors de la connexion à la base de données :', error);
        return [];
    }
}


module.exports = {
    select_,
    insert_,
    update_,
    delete_,
};