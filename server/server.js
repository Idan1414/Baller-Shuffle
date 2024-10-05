const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');

const app = express(); //initiate the express app

app.use(express.json()); // in order to parse JSON in the req.body for example.

const cors = require('cors');
app.use(cors()); // Cross-Origin Resource Sharing, in order to access from different domains.

require('dotenv').config();// allowing calling vars from .env
const jwtSecret = process.env.JWT_SECRET;


const delay = ms => new Promise(resolve => setTimeout(resolve, ms));


//Wrapper for the db.query
const promiseQuery = (sql, params) => {
  //returns Promise object with arguments Resolve or reject
  return new Promise((resolve, reject) => {
    //callBack func to get fill in the arguments Resolve or Reject
    //results = array of the rows from the query . fields = array of the column heads name and type
    db.query(sql, params, (err, results, fields) => {
      if (err) {
        reject(err);
      } else {
        resolve({ results, fields });
      }
    });
  });
}

//-----------------------------------------------------------------------------------------------


// Registration endpoint
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username already exists in the database
    const { results } = await promiseQuery('SELECT * FROM users WHERE username = ?', [username]);

    // If the username already exists, send a 409 Conflict response
    if (results.length > 0) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    // If the username does not exist, hash the password and save the user in the database
    const hashedPassword = await bcrypt.hash(password, 10);
    await promiseQuery('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)', [username, username, hashedPassword]);

    res.status(201).send('User registered');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error registering user');
  }
});

//-----------------------------------------------------------------------------------------------


// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Check if the username  exists in the database
    const { results } = await promiseQuery('SELECT * FROM users WHERE username = ?', [username]);
    if (results.length === 0) {
      return res.status(404).send('User not found');
    }
    //Takes the first row (only row)
    const user = results[0];
    //Checks password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (passwordMatch) {
      console.log(user);
      //Gives the user a token
      const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '24h' });
      res.status(200).json({ userId: user.id, message: 'Logged in', token });
    } else {
      res.status(401).send('Password incorrect');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error logging in');
  }
});


//-----------------------------------------------------------------------------------------------

//Token generation
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};


//-----------------------------------------------------------------------------------------------

// Courts endpoint
app.get('/api/courts/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const { results } = await promiseQuery(
      `SELECT c.id, c.courtName, c.courtType
      FROM courts AS c
      JOIN user_user_courts AS uc ON c.id = uc.courtId
      WHERE uc.userId = ?`,
      [userId]
    );
    if (results.length === 0) {
      return res.status(404).json({ message: 'No courts found' });
    }
    const courts = results.map(c => ({
      id: c.id,
      courtName: c.courtName,
      courtType: c.courtType
    }));
    res.json(courts);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching courts');
  }
});






//-----------------------------------------------------------------------------------------------





// Players endpoint
app.get('/api/players/:court_id', authenticateToken, async (req, res) => {
  try {
    const courtId = req.params.court_id;
    const { results } = await promiseQuery(
      `SELECT p.*, bpa.* FROM ballershuffleschema.players as p
       LEFT JOIN basketball_player_attributes as bpa on p.id = bpa.playerId
       WHERE courtId = ?`,
      [courtId]
    );
    if (results.length === 0) {
      return res.status(404).json({ message: 'No players found' });
    }
    const players = results.map(p => ({
      playerId: p.playerId,
      name: p.name,
      scoring: p.scoring,
      passing: p.passing,
      speed: p.speed,
      physical: p.physical,
      defence: p.defence,
      threePtShot: p.threePtShot,
      rebound: p.rebound,
      ballHandling: p.ballHandling,
      postUp: p.postUp,
      height: p.height,
      overall: p.overall,
      overallToMix: p.overallToMix,
      user_fk: p.user_fk,               
      creator_user_fk: p.creator_user_fk
    }));
    res.json(players); //sending it as a JSON file to the client
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching players');
  }
});


//-----------------------------------------------------------------------------------------------
// Averages endpoint
app.get('/api/court/:court_id/averages', authenticateToken, async (req, res) => {
  try {
    const courtId = req.params.court_id;

    const { results } = await promiseQuery(
      `
    SELECT 
    AVG(bpa.scoring) AS avgScoring,
    MAX(bpa.scoring) AS maxScoring,
    MIN(bpa.scoring) AS minScoring,
    AVG(bpa.passing) AS avgPassing,
    MAX(bpa.passing) AS maxPassing,
    MIN(bpa.passing) AS minPassing,
    AVG(bpa.speed) AS avgSpeed,
    MAX(bpa.speed) AS maxSpeed,
    MIN(bpa.speed) AS minSpeed,
    AVG(bpa.physical) AS avgPhysical,
    MAX(bpa.physical) AS maxPhysical,
    MIN(bpa.physical) AS minPhysical,
    AVG(bpa.defence) AS avgDefence,
    MAX(bpa.defence) AS maxDefence,
    MIN(bpa.defence) AS minDefence,
    AVG(bpa.threePtShot) AS avgThreePtShot,
    MAX(bpa.threePtShot) AS maxThreePtShot,
    MIN(bpa.threePtShot) AS minThreePtShot,
    AVG(bpa.rebound) AS avgRebound,
    MAX(bpa.rebound) AS maxRebound,
    MIN(bpa.rebound) AS minRebound,
    AVG(bpa.ballHandling) AS avgBallHandling,
    MAX(bpa.ballHandling) AS maxBallHandling,
    MIN(bpa.ballHandling) AS minBallHandling,
    AVG(bpa.postUp) AS avgPostUp,
    MAX(bpa.postUp) AS maxPostUp,
    MIN(bpa.postUp) AS minPostUp,
    AVG(bpa.overall) AS avgOverall,
    MAX(bpa.overall) AS maxOverall,
    MIN(bpa.overall) AS minOverall
    FROM 
        ballershuffleschema.players p
    LEFT JOIN 
        ballershuffleschema.basketball_player_attributes bpa ON p.id = bpa.playerId
    WHERE 
    p.courtId = ?;

      `,
      [courtId]
    );

    if (results.length === 0 || results[0].avgScoring === null) {
      return res.status(404).json({ message: 'No players found for this court' });
    }

    const averages = results[0];
    res.json(averages);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching averages');
  }
});

//-----------------------------------------------------------------------------------------------
// Create Player Endpoint
app.post('/api/create_player/:court_id/:creator_user_fk', authenticateToken, async (req, res) => {
  const court_Id = req.params.court_id;
  const creator_user_fk = req.params.creator_user_fk;
  const { name, scoring, passing, speed, physical, defence, threePtShot, rebound, ballHandling, postUp, height, overall } = req.body;

  try {
    // First query: Insert into "players" table
    const insertPlayerResult = await promiseQuery(
      'INSERT INTO ballershuffleschema.players (name, courtId, type, user_fk, creator_user_fk) VALUES (?, ?, ?, ?, ?)',
      [name, court_Id, 'Basketball', null, creator_user_fk]
    );

    await delay(50);



    // Fetch the last inserted player based on unique attributes (like name and courtId) in order to get the ID
    const { results } = await promiseQuery(
      'SELECT id FROM ballershuffleschema.players WHERE name = ? AND courtId = ? ORDER BY id DESC LIMIT 1',
      [name, court_Id]
    );

    if (results.length === 0) {
      return res.status(500).send('Error retrieving player ID');
    }

    const playerId = results[0].id;

    await delay(50);

    // Second query: Insert into "basketball_player_attributes" table
    await promiseQuery(
      'INSERT INTO ballershuffleschema.basketball_player_attributes (playerId, scoring, passing, speed, physical, defence, threePtShot, rebound, ballHandling, postUp, height, overall,overallToMix) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [playerId, scoring, passing, speed, physical, defence, threePtShot, rebound, ballHandling, postUp, height, overall, 0]
    );

    res.status(201).send('Player created successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating player');
  }
});




//-----------------------------------------------------------------------------------------------


// Get one Player endpoint
app.get('/api/player/:player_id/:court_id', authenticateToken, async (req, res) => {
  try {
    const courtId = req.params.court_id;
    const playerId = req.params.player_id;
    const { results } = await promiseQuery(
      `SELECT * FROM ballershuffleschema.players as p
       LEFT JOIN basketball_player_attributes as bpa on p.id = bpa.playerId
       WHERE courtId = ? AND playerId = ?`,
      [courtId, playerId]
    );
    if (results.length === 0) {
      return res.status(404).json({ message: 'couldnt find the player' });
    }
    const p = results[0]; // Assuming `results` has at least one entry

    const player = {
      playerId: p.playerId,
      name: p.name,
      scoring: p.scoring,
      passing: p.passing,
      speed: p.speed,
      physical: p.physical,
      defence: p.defence,
      threePtShot: p.threePtShot,
      rebound: p.rebound,
      ballHandling: p.ballHandling,
      postUp: p.postUp,
      height: p.height,
      overall: p.overall,
      overallToMix: p.overallToMix
    };
    res.json(player); //sending it as a JSON file to the client
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching player');
  }
});



//-----------------------------------------------------------------------------------------------

// Check if User_fk exists for a Player endpoint
app.get('/api/is_player_assinged/:player_id', authenticateToken, async (req, res) => {
  try {
    const playerId = req.params.player_id;

    const { results } = await promiseQuery(
      `SELECT user_fk FROM ballershuffleschema.players WHERE id = ?`,
      [playerId]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: 'Player not found' });
    }

    const userFkExists = results[0].user_fk !== null; // Check if user_fk is not null
    res.json({ userFkExists }); // Sending the result as a JSON file to the client
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching user_fk for player');
  }
});


//-----------------------------------------------------------------------------------------------

// Update Player endpoint
app.put('/api/update_player/:player_id/:court_id', authenticateToken, async (req, res) => {
  try {
    const courtId = req.params.court_id;
    const playerId = req.params.player_id;
    const {
      name,
      scoring,
      passing,
      speed,
      physical,
      defence,
      threePtShot,
      rebound,
      ballHandling,
      postUp,
      height,
      overall,
      overallToMix
    } = req.body;

    const updateName = `UPDATE ballershuffleschema.players SET name = ? WHERE id = ?`

      ;
    await promiseQuery(updateName, [name, playerId]);

    await delay(50);


    const updateQuery = ` UPDATE ballershuffleschema.basketball_player_attributes
      SET scoring = ?, passing = ?, speed = ?, physical = ?, defence = ?, 
          threePtShot = ?, rebound = ?, ballHandling = ?, postUp = ?, height = ?, 
          overall = ?, overallToMix = ?
      WHERE playerId = ?`;



    await promiseQuery(updateQuery,
      [scoring, passing, speed, physical, defence, threePtShot, rebound,
        ballHandling, postUp, height, overall, overallToMix, playerId]);

    res.json({ message: 'Player updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating player');
  }
});


//-----------------------------------------------------------------------------------------------
// Assign Player endpoint
app.put('/api/assign_player/:player_id/:email/:court_id', authenticateToken, async (req, res) => {
  try {
    const playerId = req.params.player_id;
    const email = req.params.email;
    const courtId = req.params.court_id;

    console.log("entered API/ assign_player with email: " + email)


    // Check if the email exists
    const { results } = await promiseQuery(
      `SELECT id FROM ballershuffleschema.users WHERE email = ?`,
      [email]
    );

    console.log(results)


    // If no user found with that email
    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'Email does not exist' });
    }

    const user_fk_to_assign = results[0].id;
    console.log(email, user_fk_to_assign, playerId);

    const assignUserFkToPlayer = `UPDATE ballershuffleschema.players SET user_fk = ? WHERE id = ?`;

    // Update the player with the found user ID
    await promiseQuery(assignUserFkToPlayer, [user_fk_to_assign, playerId]);

    await delay(50); // This seems unnecessary but kept as per your original code

    // Insert into user_user_courts only if the court doesn't already exist to the user

    await promiseQuery(
      `INSERT INTO ballershuffleschema.user_user_courts (userId, courtId)
       SELECT ?, ?
       WHERE NOT EXISTS (
         SELECT 1 FROM ballershuffleschema.user_user_courts WHERE userId = ? AND courtId = ?
       )`,
      [user_fk_to_assign, courtId, user_fk_to_assign, courtId]
    );

    // Successful assignment
    res.json({ message: 'Player assigned successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error assigning player');
  }
});








//-----------------------------------------------------------------------------------------------



// Delete Player endpoint
app.delete('/api/delete_player/:player_id/:court_id', authenticateToken, async (req, res) => {
  try {
    const courtId = req.params.court_id;
    const playerId = req.params.player_id;

    // Delete from basketball_player_attributes table
    await promiseQuery(
      'DELETE FROM ballershuffleschema.basketball_player_attributes WHERE playerId = ?',
      [playerId]
    );

    await delay(50);


    // Delete from players table
    await promiseQuery(
      'DELETE FROM ballershuffleschema.players WHERE id = ? AND courtId = ?',
      [playerId, courtId]
    );


    res.status(200).json({ message: 'Player deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting player');
  }
});

//-----------------------------------------------------------------------------------------------



// Create Court Endpoint
app.post('/api/create_court/:user_id', authenticateToken, async (req, res) => {
  const userId = req.params.user_id;
  const { courtName, courtType } = req.body;
  try {
    // First query: Insert into "courts" table
    await promiseQuery(
      'INSERT INTO ballershuffleschema.courts (created_at, courtName, courtType) VALUES (NOW(), ?, ?)',
      [courtName, courtType]
    );

    await delay(50);


    // Fetch the last inserted court based on unique attributes (like courtName and userId) to get the ID
    const { results } = await promiseQuery(
      'SELECT id FROM ballershuffleschema.courts WHERE courtName = ? ORDER BY id DESC LIMIT 1',
      [courtName]
    );

    if (results.length === 0) {
      return res.status(500).send('Error retrieving court ID');
    }


    const courtId = results[0].id;

    await delay(50);

    //Add admin
    await promiseQuery(
      'INSERT INTO ballershuffleschema.court_admins (user_id, court_id, is_admin) VALUES (?, ?, ?)',
      [userId, courtId, 1]
    );
    await delay(50);


    //Add to user_user_courts
    await promiseQuery(
      'INSERT INTO ballershuffleschema.user_user_courts (userId, courtId) VALUES (?, ?)',
      [userId, courtId]
    );

    res.status(201).json({
      message: 'Court created successfully',
      courtId,
      courtName,
      courtType
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating court');
  }
});

//-----------------------------------------------------------------------------------------------

//isAdmin endpoint:
app.get('/api/is_admin/:user_id/:court_id', (req, res) => {
  const courtId = req.params.court_id;
  const userId = req.params.user_id;
  console.log(userId, courtId)
  const query = 'SELECT is_admin FROM ballershuffleschema.court_admins WHERE user_id = ? AND court_id = ?';
  db.query(query, [userId, courtId], (error, results) => {
    if (error) return res.status(500).send(error);
    if (results.length > 0 && results[0].is_admin === 1) {
      res.json({ isAdmin: true });
    } else {
      res.json({ isAdmin: false });
    }
  });
});


//-----------------------------------------------------------------------------------------------


// Delete Court endpoint
app.delete('/api/delete_court/:user_id/:court_id', authenticateToken, async (req, res) => {
  try {
    const courtId = req.params.court_id;
    const userId = req.params.user_id;

    // Delete from basketball_player_attributes table
    await promiseQuery(
      'DELETE FROM ballershuffleschema.user_user_courts WHERE userId = ? AND courtId = ?',
      [userId, courtId]
    );

    res.status(200).json({ message: 'Court deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting court');
  }
});



//-----------------------------------------------------------------------------------------------


const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'ballershuffleschema'
});

db.connect(err => {
  if (err) {
    throw err;
  }
  console.log('Connected to the database');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
