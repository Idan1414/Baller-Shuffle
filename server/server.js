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
app.get('/api/courts/:id',authenticateToken, async (req, res) => {
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
app.get('/api/players/:court_id',authenticateToken, async (req, res) => {
  try {
    const courtId = req.params.court_id;
    const { results } = await promiseQuery(
      `SELECT * FROM ballershuffleschema.players as p
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
      overallToMix: p.overallToMix
    }));
    res.json(players); //sending it as a JSON file to the client
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching players');
  }
});


//-----------------------------------------------------------------------------------------------



// Create Player Endpoint
app.post('/api/create_player/:court_id', authenticateToken, async (req, res) => {
  const court_Id = req.params.court_id;
  const { name, scoring, passing, speed, physical, defence, threePtShot, rebound, ballHandling, postUp, height, overall } = req.body;
  console.log(court_Id)
  try {
    // First query: Insert into "players" table
    const insertPlayerResult = await promiseQuery(
      'INSERT INTO ballershuffleschema.players (name, courtId, type, user_fk) VALUES (?, ?, ?, ?)',
      [name, court_Id, 'Basketball', null]
    );


       // Fetch the last inserted player based on unique attributes (like name and courtId) in order to get the ID
       const { results } = await promiseQuery(
        'SELECT id FROM ballershuffleschema.players WHERE name = ? AND courtId = ? ORDER BY id DESC LIMIT 1',
        [name, court_Id]
      );
  
      if (results.length === 0) {
        return res.status(500).send('Error retrieving player ID');
      }
  
      const playerId = results[0].id;

    
    // Second query: Insert into "basketball_player_attributes" table
    await promiseQuery(
      'INSERT INTO ballershuffleschema.basketball_player_attributes (playerId, scoring, passing, speed, physical, defence, threePtShot, rebound, ballHandling, postUp, height, overall,overallToMix) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [playerId, scoring, passing, speed, physical, defence, threePtShot, rebound, ballHandling, postUp, height, overall , 0]
    );

    res.status(201).send('Player created successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating player');
  }
});




//-----------------------------------------------------------------------------------------------


// Get one Player endpoint
app.get('/api/player/:player_id/:court_id',authenticateToken, async (req, res) => {
  try {
    const courtId = req.params.court_id;
    const playerId = req.params.player_id;
    const { results } = await promiseQuery(
      `SELECT * FROM ballershuffleschema.players as p
       LEFT JOIN basketball_player_attributes as bpa on p.id = bpa.playerId
       WHERE courtId = ? AND playerId = ?`,
       [courtId,playerId]
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
    await promiseQuery(updateName, [name,playerId]);


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


const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

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
      [userId, courtId, 1 ]
    );
    await delay(50);


    //Add to user_user_courts
    await promiseQuery(
      'INSERT INTO ballershuffleschema.user_user_courts (userId, courtId) VALUES (?, ?)',
      [userId, courtId ]
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


// Delete Court endpoint
app.delete('/api/delete_court/:user_id/:court_id', authenticateToken, async (req, res) => {
  try {
    const courtId = req.params.court_id;
    const userId = req.params.user_id;

    // Delete from basketball_player_attributes table
    await promiseQuery(
      'DELETE FROM ballershuffleschema.user_user_courts WHERE userId = ? AND courtId = ?',
      [userId,courtId]
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

  const PORT = 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
