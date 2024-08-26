const fs = require('fs');
const mysql = require('mysql');
const util = require('util');

// Promisify the readFile function
const readFileAsync = util.promisify(fs.readFile);

// Create MySQL database connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Idan27091999!', // Change this to your actual password
    database: 'ballershuffleschema'
});

// Promisify connection.query method for easier use with async/await
connection.query = util.promisify(connection.query);

async function loadData() {
    try {
        // Read and parse JSON data
        const jsonData = await readFileAsync('CourtsUpdated29022024.json', 'utf8');
        const data = JSON.parse(jsonData);

        // Connect to the database
        await connection.connect();

        const courtNameToId = {
            'Shishi Savyon': 1,
            'BeerSheva Matmidim': 2,
            'Ganey Tikva': 3
        };

        for (const courtData of data) {
            const { courtName, courtType, players } = courtData;
            const courtId = courtNameToId[courtName]; // Map the court name to its ID

            if (!courtId) {
                console.error(`Court name "${courtName}" does not have a corresponding ID.`);
                continue; // Skip this court if its ID is not found
            }

            for (const player of players) {
                const { name, ...attributes } = player;
                // Insert player into `players` table
                const playerInsertQuery = `
                    INSERT INTO players (name, courtId, type, user_fk)
                    VALUES (?, ?, ?, NULL)`;
                const playerInsertResult = await connection.query(playerInsertQuery, [name, courtId, courtType]);
                const newPlayerId = playerInsertResult.insertId;

                // Insert attributes based on courtType
                if (courtType === 'Basketball') {
                    const basketballAttributesInsertQuery = `
                        INSERT INTO basketball_player_attributes
                        (playerId, scoring, passing, speed, physical, defence, threePtShot, rebound, ballHandling, postUp, height, overall, overallToMix)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                    await connection.query(basketballAttributesInsertQuery, [
                        newPlayerId, attributes.scoring, attributes.passing, attributes.speed, attributes.physical,
                        attributes.defence, attributes.threePtShot, attributes.rebound, attributes.ballHandling,
                        attributes.postUp, attributes.height, attributes.overall, attributes.overallToMix || 0
                    ]);
                } else if (courtType === 'Football') {
                    // Assuming football_player_attributes table and its columns are correctly set up
                    const footballAttributesInsertQuery = `
                        INSERT INTO football_player_attributes
                        (playerId, finishing, passing, speed, physical, defence, dribbling, header, overall, overallToMix)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                    await connection.query(footballAttributesInsertQuery, [
                        newPlayerId, attributes.finishing, attributes.passing, attributes.speed, attributes.physical,
                        attributes.defence, attributes.dribbling, attributes.header, attributes.overall, attributes.overallToMix || 0
                    ]);
                }
            }
        }
    } catch (err) {
        console.error('An error occurred:', err);
    } finally {
        // Close database connection
        connection.end();
    }
}

loadData();
