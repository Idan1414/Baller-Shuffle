const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const multer = require('multer');


const app = express(); //initiate the express app

app.use(express.json()); // in order to parse JSON in the req.body for example.

const cors = require('cors');
app.use(cors()); // Cross-Origin Resource Sharing, in order to access from different domains.

require('dotenv').config();// allowing calling vars from .env
const jwtSecret = process.env.JWT_SECRET;


const delay = ms => new Promise(resolve => setTimeout(resolve, ms));



// Configure multer for profile images
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});




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


// Error handling middleware for multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File is too large. Max size is 5MB' });
    }
    return res.status(400).json({ message: error.message });
  }
  next(error);
});

//-----------------------------------------------------------------------------------------------



const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'IdanSQL',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'ballershuffleschema'
});


db.connect(err => {
  if (err) {
    console.error('Database connection error:', err);
    return; // Prevent starting the server if DB connection fails
  }
  console.log('Connected to the database');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
//---------------------------------------------------------------------------------------

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
    const hashedPassword = await bcrypt.hash(password, 10); //10 rounds of hashing
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
    // Check if the username exists in the database
    const { results } = await promiseQuery('SELECT * FROM users WHERE username = ?', [username]);
    if (results.length === 0) {
      return res.status(404).send('User not found');
    }

    // Takes the first row (only row)
    const user = results[0];

    // Checks password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (passwordMatch) {
      console.log(user);

      // Fetch courts associated with the user
      const { results: courtResults } = await promiseQuery('SELECT courtId FROM user_user_courts WHERE userId = ?', [user.id]);
      const courts = courtResults.map(court => court.courtId); // Assuming court_id is the column name

      // Create the token payload with userId and courts
      const tokenPayload = {
        userId: user.id,
        courts: courts, // Array of court IDs the user has access to
        // Other user info can be added here if needed
      };

      // Generates the token
      const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '24h' });

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
// Update token endpoint
app.post('/api/update-token', async (req, res) => {
  const { token } = req.body; // The current token

  try {
    // Verify the token
    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    // Fetch updated courts associated with the user
    const { results: courtResults } = await promiseQuery('SELECT courtId FROM user_user_courts WHERE userId = ?', [userId]);
    const updatedCourts = courtResults.map(court => court.courtId);

    // Create a new token payload with the updated courts
    const newTokenPayload = {
      userId: decoded.userId,
      courts: updatedCourts, // Updated courts
    };

    // Sign a new token with the updated data
    const newToken = jwt.sign(newTokenPayload, jwtSecret, { expiresIn: '24h' });

    res.status(200).json({ token: newToken });
  } catch (error) {
    console.error('Error updating token', error);
    res.status(500).send('Failed to update token');
  }
});

//-----------------------------------------------------------------------------------------------


// Create bug report endpoint
app.post('/api/bug-report', authenticateToken, async (req, res) => {
  try {
    const { userId, message } = req.body;

    // Get username from users table
    const { results: userResults } = await promiseQuery(
      'SELECT username FROM ballershuffleschema.users WHERE id = ?',
      [userId]
    );

    if (userResults.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const username = userResults[0].username;

    // Insert the bug report
    await promiseQuery(
      `INSERT INTO ballershuffleschema.bug_reports (user_id, username, message)
       VALUES (?, ?, ?)`,
      [userId, username, message]
    );

    res.status(201).json({ message: 'Bug report submitted successfully' });
  } catch (error) {
    console.error('Error submitting bug report:', error);
    res.status(500).json({ error: 'Failed to submit bug report' });
  }
});
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

// One Court endpoint
app.get('/api/court_info/:court_id', authenticateToken, async (req, res) => {
  try {
    const courtId = req.params.court_id;
    const { results } = await promiseQuery(
      `SELECT c.courtName, c.courtType
      FROM courts AS c
      WHERE c.id = ?`,
      [courtId]
    );
    if (results.length === 0) {
      return res.status(404).json({ message: 'No courts found' });
    }
    const court = results.map(c => ({
      courtName: c.courtName,
      courtType: c.courtType
    }));
    res.json(court);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching courts');
  }
});






//-----------------------------------------------------------------------------------------------



//FOOTBALL_Players endpoint
app.get('/api/football_players/:court_id', authenticateToken, async (req, res) => {
  try {
    const courtId = req.params.court_id;
    const { results } = await promiseQuery(
      `SELECT p.*, fpa.* FROM ballershuffleschema.players as p
       LEFT JOIN football_player_attributes as fpa on p.id = fpa.playerId
       WHERE courtId = ?`,
      [courtId]
    );
    if (results.length === 0) {
      return res.status(404).json({ message: 'No players found' });
    }
    const players = results.map(p => ({
      playerId: p.playerId,
      name: p.name,
      num_of_mvps: p.num_of_mvps,
      finishing: p.finishing,
      passing: p.passing,
      speed: p.speed,
      physical: p.physical,
      defence: p.defence,
      dribbling: p.dribbling,
      stamina: p.stamina,
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


// Basketball_Players endpoint
app.get('/api/players/:court_id', authenticateToken, async (req, res) => {
  try {
    const courtId = req.params.court_id;
    const { results } = await promiseQuery(
      `SELECT p.id as pId , p.*, bpa.* FROM ballershuffleschema.players as p
       LEFT JOIN basketball_player_attributes as bpa on p.id = bpa.playerId
       WHERE courtId = ?`,
      [courtId]
    );
    if (results.length === 0) {
      return res.status(404).json({ message: 'No players found' });
    }
    const players = results.map(p => ({
      playerId: p.pId,
      name: p.name,
      num_of_mvps: p.num_of_mvps,
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


// BASKETBALL - Averages endpoint
app.get('/api/court_averages/:court_id/', authenticateToken, async (req, res) => {
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
// FOOTBALL - Averages endpoint
app.get('/api/football_court_averages/:court_id/', authenticateToken, async (req, res) => {
  try {
    const courtId = req.params.court_id;

    const { results } = await promiseQuery(
      `
    SELECT 
    AVG(fpa.finishing) AS avgFinishing,
    MAX(fpa.finishing) AS maxFinishing,
    MIN(fpa.finishing) AS minFinishing,
    AVG(fpa.passing) AS avgPassing,
    MAX(fpa.passing) AS maxPassing,
    MIN(fpa.passing) AS minPassing,
    AVG(fpa.speed) AS avgSpeed,
    MAX(fpa.speed) AS maxSpeed,
    MIN(fpa.speed) AS minSpeed,
    AVG(fpa.physical) AS avgPhysical,
    MAX(fpa.physical) AS maxPhysical,
    MIN(fpa.physical) AS minPhysical,
    AVG(fpa.defence) AS avgDefence,
    MAX(fpa.defence) AS maxDefence,
    MIN(fpa.defence) AS minDefence,
    AVG(fpa.dribbling) AS avgDribbling,
    MAX(fpa.dribbling) AS maxDribbling,
    MIN(fpa.dribbling) AS minDribbling,
    AVG(fpa.stamina) AS avgStamina,
    MAX(fpa.stamina) AS maxStamina,
    MIN(fpa.stamina) AS minStamina,
    AVG(fpa.overall) AS avgOverall,
    MAX(fpa.overall) AS maxOverall,
    MIN(fpa.overall) AS minOverall
    FROM 
        ballershuffleschema.players p
    LEFT JOIN 
        ballershuffleschema.football_player_attributes fpa ON p.id = fpa.playerId
    WHERE 
    p.courtId = ?;

      `,
      [courtId]
    );

    if (results.length === 0 || results[0].avgFinishing === null) {
      return res.status(404).json({ message: 'No players in this court, no averages to present yet.' });
    }

    const averages = results[0];
    res.json(averages);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching averages');
  }
});

//-----------------------------------------------------------------------------------------------
// Create Player Endpoint - BASKETBALL
app.post('/api/create_player/:court_id/:creator_user_fk', authenticateToken, async (req, res) => {
  const court_Id = req.params.court_id;
  const creator_user_fk = req.params.creator_user_fk;
  const { name, scoring, passing, speed, physical, defence, threePtShot, rebound, ballHandling, postUp, height, overall, priority } = req.body;

  try {
    // Validate name length
    if (!name || name.trim().length === 0 || name.length > 30) {
      return res.status(400).json({
        error: 'Name must be between 1 and 30 characters long'
      });
    }

    // Check if name already exists in this court
    const { results: existingPlayer } = await promiseQuery(
      'SELECT id FROM ballershuffleschema.players WHERE name = ? AND courtId = ?',
      [name, court_Id]
    );

    if (existingPlayer.length > 0) {
      return res.status(409).json({
        error: 'A player with this name already exists in this court'
      });
    }

    // First query: Insert into "players" table
    const insertPlayerResult = await promiseQuery(
      'INSERT INTO ballershuffleschema.players (name, courtId, type, user_fk, creator_user_fk, priority) VALUES (?, ?, ?, ?, ?, ?)',
      [name, court_Id, 'Basketball', null, creator_user_fk, priority]
    );

    await delay(50);

    // Fetch the last inserted player based on unique attributes
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
      'INSERT INTO ballershuffleschema.basketball_player_attributes (playerId, scoring, passing, speed, physical, defence, threePtShot, rebound, ballHandling, postUp, height, overall, overallToMix) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [playerId, scoring, passing, speed, physical, defence, threePtShot, rebound, ballHandling, postUp, height, overall, 0]
    );

    res.status(201).send('Player created successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating player');
  }
});




//-----------------------------------------------------------------------------------------------
// Create Player Endpoint - FOOTBALL
app.post('/api/create_player_football/:court_id/:creator_user_fk', authenticateToken, async (req, res) => {
  const court_Id = req.params.court_id;
  const creator_user_fk = req.params.creator_user_fk;
  const { name, finishing, passing, speed, physical, defence, dribbling, stamina, overall, priority } = req.body;

  try {

    // Validate name length
    if (!name || name.trim().length === 0 || name.length > 30) {
      return res.status(400).json({
        error: 'Name must be between 1 and 30 characters long'
      });
    }

    // Check if name already exists in this court
    const { results: existingPlayer } = await promiseQuery(
      'SELECT id FROM ballershuffleschema.players WHERE name = ? AND courtId = ?',
      [name, court_Id]
    );

    if (existingPlayer.length > 0) {
      return res.status(409).json({
        error: 'A player with this name already exists in this court'
      });
    }
    // First query: Insert into "players" table
    const insertPlayerResult = await promiseQuery(
      'INSERT INTO ballershuffleschema.players (name, courtId, type, user_fk, creator_user_fk,priority) VALUES (?, ?, ?, ?, ?,?)',
      [name, court_Id, 'Football', null, creator_user_fk, priority]
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
      'INSERT INTO ballershuffleschema.football_player_attributes (playerId, finishing, passing, speed, physical, defence, dribbling, stamina, overall, overallToMix) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [playerId, finishing, passing, speed, physical, defence, dribbling, stamina, overall, 0]
    );

    res.status(201).send('Player created successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating player');
  }
});

//-----------------------------------------------------------------------------------------------


// Get one Football-Player endpoint
app.get('/api/football-player/:player_id/:court_id', authenticateToken, async (req, res) => {
  try {
    const courtId = req.params.court_id;
    const playerId = req.params.player_id;
    const { results } = await promiseQuery(
      `SELECT * FROM ballershuffleschema.players as p
       LEFT JOIN football_player_attributes as fpa on p.id = fpa.playerId
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
      priority: p.priority,
      creator_user_fk: p.creator_user_fk,
      finishing: p.finishing,
      passing: p.passing,
      speed: p.speed,
      physical: p.physical,
      defence: p.defence,
      dribbling: p.dribbling,
      stamina: p.stamina,
      overall: p.overall,
      overallToMix: p.overallToMix,
    };
    res.json(player); //sending it as a JSON file to the client
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching player');
  }
});


//-----------------------------------------------------------------------------------------------


// Get one Basketball-Player endpoint
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
      priority: p.priority,
      creator_user_fk: p.creator_user_fk,
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
    };
    res.json(player); //sending it as a JSON file to the client
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching player');
  }
});


//-----------------------------------------------------------------------------------------------


// Get My Player ID endpoint
app.get('/api/my-player/:user_id/:court_id', authenticateToken, async (req, res) => {
  try {
    const courtId = req.params.court_id;
    const userId = req.params.user_id;
 
    const { results } = await promiseQuery(
      `SELECT p.id as playerId
       FROM ballershuffleschema.players as p
       WHERE p.courtId = ? AND p.user_fk = ?`,
      [courtId, userId]
    );
 
    if (results.length === 0) {
      return res.status(404).json({ message: 'No player found for this user in this court' });
    }
 
    res.json({ playerId: results[0].playerId });
 
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching player ID');
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
    const userFk = results[0].user_fk;
    const userFkExists = userFk !== null;

    res.json({
      userFkExists,
      user_fk: userFkExists ? userFk : null // Only include the value if it exists
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching user_fk for player');
  }
});


//-----------------------------------------------------------------------------------------------

// Update Player endpoint
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
      priority,
      overallToMix
    } = req.body;

    // Validate name length
    if (!name || name.trim().length === 0 || name.length > 30) {
      return res.status(400).json({
        error: 'Name must be between 1 and 30 characters long'
      });
    }

    // Check if name already exists in this court for a DIFFERENT player
    const { results: existingPlayer } = await promiseQuery(
      'SELECT id FROM ballershuffleschema.players WHERE name = ? AND courtId = ? AND id != ?',
      [name, courtId, playerId]
    );

    if (existingPlayer.length > 0) {
      return res.status(409).json({
        error: 'A player with this name already exists in this court'
      });
    }

    const updateNameAndPriority = `UPDATE players SET name = ?, priority = ? WHERE id = ?`;
    await promiseQuery(updateNameAndPriority, [name, priority, playerId]);

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


// Update Football-Player endpoint
app.put('/api/update-player-football/:player_id/:court_id', authenticateToken, async (req, res) => {
  try {
    const courtId = req.params.court_id;
    const playerId = req.params.player_id;
    const {
      name,
      finishing,
      passing,
      speed,
      physical,
      defence,
      dribbling,
      stamina,
      overall,
      priority,
      overallToMix
    } = req.body;


    // Validate name length
    if (!name || name.trim().length === 0 || name.length > 30) {
      return res.status(400).json({
        error: 'Name must be between 1 and 30 characters long'
      });
    }

    // Check if name already exists in this court
    const { results: existingPlayer } = await promiseQuery(
      'SELECT id FROM ballershuffleschema.players WHERE name = ? AND courtId = ? AND id != ?',
      [name, courtId, playerId]
    );

    if (existingPlayer.length > 0) {
      return res.status(409).json({
        error: 'A player with this name already exists in this court'
      });
    }


    const updateNameAndPriority = `UPDATE players SET name = ?, priority = ? WHERE id = ?`;
    await promiseQuery(updateNameAndPriority, [name, priority, playerId]);

    await delay(50);


    const updateQuery = ` UPDATE ballershuffleschema.football_player_attributes
      SET finishing = ?, passing = ?, speed = ?, physical = ?, defence = ?, 
          dribbling = ?, stamina = ?, overall = ?, overallToMix = ?
      WHERE playerId = ?`;



    await promiseQuery(updateQuery,
      [finishing, passing, speed, physical, defence, dribbling, stamina,
        overall, overallToMix, playerId]);

    res.json({ message: 'Player updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating player');
  }
});



// ------------------------------------------New separate endpoint for profile picture updates
app.put('/api/update-player-picture/:player_id/:court_id', authenticateToken, upload.single('profileImage'), async (req, res) => {
  try {
    const playerId = req.params.player_id;

    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }

    const updateQuery = `
      UPDATE ballershuffleschema.players 
      SET profile_image = ?
      WHERE id = ?
    `;

    await promiseQuery(updateQuery, [req.file.buffer, playerId]);

    res.json({ message: 'Profile picture updated successfully' });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).send('Error updating profile picture');
  }
});

// Optional: Endpoint to get the profile picture
app.get('/api/player-picture/:player_id', authenticateToken, async (req, res) => {
  try {
    const playerId = req.params.player_id;

    const query = 'SELECT profile_image FROM ballershuffleschema.players WHERE id = ?';
    const { results } = await promiseQuery(query, [playerId]);

    if (!results[0] || !results[0].profile_image) {
      return res.status(404).send('No profile picture found');
    }

    res.writeHead(200, {
      'Content-Type': 'image/jpeg',
      'Content-Length': results[0].profile_image.length
    });
    res.end(results[0].profile_image);
  } catch (error) {
    console.error('Error fetching profile picture:', error);
    res.status(500).send('Error fetching profile picture');
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



    // If no user found with that email
    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'Email does not exist' });
    }



    const user_fk_to_assign = results[0].id;
    console.log(email, user_fk_to_assign, playerId);

    //Make sure only one player in a court will be assinged to 1 user
    const { results: playerCheckResults } = await promiseQuery(
      `SELECT * FROM ballershuffleschema.players 
       WHERE user_fk = ? AND courtId = ?`,
      [user_fk_to_assign, courtId]
    );

    // If the user is already assigned to the player in the court
    if (playerCheckResults && playerCheckResults.length > 0) {
      return res.status(400).json({ message: 'User is already assigned to a player in the specified court' });
    }

    const assignUserFkToPlayer = `UPDATE ballershuffleschema.players SET user_fk = ? WHERE id = ?`;

    // Update the player with the found user ID
    await promiseQuery(assignUserFkToPlayer, [user_fk_to_assign, playerId]);

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


    // Get player info before updating
    const { results: playerInfo } = await promiseQuery(
      `SELECT name, user_fk FROM ballershuffleschema.players 
       WHERE id = ? AND courtId = ?`,
      [playerId, courtId]
    );

    if (playerInfo.length === 0) {
      return res.status(404).json({ message: 'Player not found' });
    }

    const user_fk = playerInfo[0].user_fk;
    const currentName = playerInfo[0].name;


    // Update player name to indicate deletion
    await promiseQuery(
      `UPDATE ballershuffleschema.players 
           SET name = ?, user_fk = NULL ,courtId = NULL
           WHERE id = ? AND courtId = ?`,
      [`Deleted(${currentName})`, playerId, courtId]
    );

    // Delete from basketball_player_attributes table
    await promiseQuery(
      'DELETE FROM ballershuffleschema.basketball_player_attributes WHERE playerId = ?',
      [playerId]
    );

    await delay(50);


    if (user_fk) {
      // Remove only this court from user_user_courts
      await promiseQuery(
        `DELETE FROM ballershuffleschema.user_user_courts 
         WHERE userId = ? AND courtId = ?`,
        [user_fk, courtId]
      );
    }

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

// Add Admin Endpoint
app.post('/api/add_admin/:court_id', authenticateToken, async (req, res) => {
  const courtId = req.params.court_id;
  const { userId } = req.body; // The user ID of the person to be added as admin

  try {
    // Check if the user is already an admin for this court
    const { results: adminCheck } = await promiseQuery(
      'SELECT * FROM ballershuffleschema.court_admins WHERE court_id = ? AND user_id = ?',
      [courtId, userId]
    );

    if (adminCheck.length > 0) {
      return res.status(409).json({ message: 'User is already an admin' });
    }

    // Add the user as an admin
    await promiseQuery(
      'INSERT INTO ballershuffleschema.court_admins (user_id, court_id, is_admin) VALUES (?, ?, ?)',
      [userId, courtId, 1] // 1 signifies is_admin
    );

    res.status(201).json({ message: 'User added as admin successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding admin');
  }
});

//-----------------------------------------------------------------------------------------------
// Update Court Name Endpoint
app.put('/api/update_court_name/:courtId', authenticateToken, async (req, res) => {
  const courtId = req.params.courtId;
  const { courtName: newCourtName } = req.body; // Corrected line

  // Validate input
  if (!newCourtName) {
    return res.status(400).send('New court name is required');
  }

  try {
    // Update the court name in the "courts" table
    const result = await promiseQuery(
      'UPDATE ballershuffleschema.courts SET courtName = ? WHERE id = ?',
      [newCourtName, courtId]
    );

    // Check if the court was updated successfully
    if (result.affectedRows === 0) {
      return res.status(404).send('Court not found');
    }

    res.status(200).json({
      message: 'Court name updated successfully',
      courtId,
      newCourtName,
    });
  } catch (error) {
    console.error('Error updating court name:', error);
    res.status(500).send('Error updating court name');
  }
});



//-----------------------------------------------------------------------------------------------

//isAdmin endpoint:
app.get('/api/is_admin/:user_id/:court_id', (req, res) => {
  const courtId = req.params.court_id;
  const userId = req.params.user_id;
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

    // UnAssign the player from the user
    await promiseQuery(
      ` UPDATE ballershuffleschema.players SET user_fk = NULL WHERE user_fk = ? AND courtId = ?`,
      [userId, courtId]
    );

    res.status(200).json({ message: 'Court deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting court');
  }
});




//-----------------------------------------------------------------------------------------------

// Scheduled Games endpoint
app.get('/api/scheduled_games/:court_id', authenticateToken, async (req, res) => {
  const courtId = req.params.court_id;

  try {
    // Query to fetch scheduled games from the database
    const { results } = await promiseQuery(
      `SELECT g.*, JSON_UNQUOTE(JSON_EXTRACT(g.mvps, '$')) AS mvp_ids
       FROM games AS g 
       WHERE g.court_id = ? 
       ORDER BY g.game_start_time DESC`, // Order by date, latest first
      [courtId]
    );

    // Check if any games were found
    if (results.length === 0) {
      return res.status(404).json({ message: 'No scheduled games found for the specified court ID.' });
    }

    // Prepare to store the final games data
    const games = [];

    // Process each game to handle multiple MVPs
    for (const game of results) {
      const mvpIds = JSON.parse(game.mvp_ids); // Parse the JSON array of MVP IDs

      // Fetch the names of the MVPs (handling multiple MVPs)
      const { results: mvpPlayers } = await promiseQuery(
        `SELECT id, name 
         FROM players 
         WHERE id IN (?)`, [mvpIds]
      );

      // Map the MVP player IDs and names
      const mvpList = mvpPlayers.map(player => ({
        id: player.id,
        name: player.name
      }));

      // Add the game data to the games array, including the MVPs
      games.push({
        game_id: game.game_id,
        game_court_id: game.court_id,
        start_date: game.game_start_time,
        start_regis: game.registration_open_time,
        close_regis: game.registration_close_time,
        max_players: game.max_players,
        num_of_teams: game.num_of_teams,
        created_by: game.created_by,
        location: game.location,
        description: game.description,
        mvps: mvpList, // Now an array of MVPs
        max_players_each_user_can_add: game.max_players_each_user_can_add
      });
    }

    // Sending the games data as a JSON response
    res.json(games);
  } catch (error) {
    // Logging the error for debugging purposes
    console.error('Error fetching scheduled games:', error);

    // Responding with a 500 status code in case of server error
    res.status(500).json({ message: 'An error occurred while fetching scheduled games.' });
  }
});




//-----------------------------------------------------------------------------------------------

// Create game API
app.post('/api/create_game', authenticateToken, (req, res) => {
  const {
    court_id,
    game_start_time,
    registration_open_time,
    registration_close_time,
    max_players,
    num_of_teams,
    created_by,
    location,
    description,
    max_players_each_user_can_add,
  } = req.body;

  // Insert query for adding a new game
  const sql = `
    INSERT INTO games (
      court_id, game_start_time, registration_open_time, registration_close_time,
      max_players, num_of_teams, created_by, location, description , max_players_each_user_can_add
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ? , ?)`;

  const params = [
    court_id,
    game_start_time,
    registration_open_time,
    registration_close_time,
    max_players,
    num_of_teams,
    created_by,
    location,
    description,
    max_players_each_user_can_add
  ];

  promiseQuery(sql, params)
    .then(({ results }) => {
      res.status(201).json({ gameId: results.insertId, message: 'Game created successfully' });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error creating game');
    });
});



// Update game API ----------------------------------------------------------------
app.put('/api/update_game/:gameId', authenticateToken, (req, res) => {
  const gameId = req.params.gameId;
  const {
    game_court_id,
    game_start_time,
    registration_open_time,
    registration_close_time,
    max_players,
    num_of_teams,
    location,
    description,
    max_players_each_user_can_add,
  } = req.body;

  // Update query for modifying an existing game
  const sql = `
    UPDATE games SET 
      court_id = ?, 
      game_start_time = ?, 
      registration_open_time = ?, 
      registration_close_time = ?, 
      max_players = ?, 
      num_of_teams = ?, 
      location = ?, 
      description = ?, 
      max_players_each_user_can_add = ?
    WHERE game_id = ?`;

  const params = [
    game_court_id,
    game_start_time,
    registration_open_time,
    registration_close_time,
    max_players,
    num_of_teams,
    location,
    description,
    max_players_each_user_can_add,
    gameId,
  ];

  promiseQuery(sql, params)
    .then(() => {
      res.status(200).json({ message: 'Game updated successfully' });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error updating game');
    });
});


/* FETCH GAME API ----------------------------------------------*/
app.get('/api/game/:game_id', authenticateToken, async (req, res) => {
  const gameId = req.params.game_id;

  try {
    // Query to fetch game details and MVPs from the database
    const { results } = await promiseQuery(
      `SELECT g.*, u.username AS creator_username
       FROM games AS g 
       LEFT JOIN users AS u ON g.created_by = u.id
       WHERE g.game_id = ?`,
      [gameId]
    );

    // Check if any game was found
    if (results.length === 0) {
      return res.status(404).json({ message: 'Game not found.' });
    }

    const game = results[0]; // Get the first result since game_id is unique

    // Fetch MVPs (since it's stored as JSON in the `mvps` column)
    const mvpIds = game.mvps ? JSON.parse(game.mvps) : []; // Parse the JSON array

    let mvps = [];
    if (mvpIds.length > 0) {
      const mvpQuery = `SELECT id, name FROM players WHERE id IN (?)`;
      const mvpResults = await promiseQuery(mvpQuery, [mvpIds]);
      mvps = mvpResults.results; // Array of MVP player objects with `id` and `name`
    }

    // Mapping results to a structured format
    const gameDetails = {
      game_id: game.game_id,
      game_court_id: game.court_id,
      game_start_time: game.game_start_time,
      registration_open_time: game.registration_open_time,
      registration_close_time: game.registration_close_time,
      max_players: game.max_players,
      num_of_teams: game.num_of_teams,
      created_by: {
        user_id: game.created_by,
        username: game.creator_username // Getting the username of the creator
      },
      location: game.location,
      description: game.description,
      mvps, // Array of MVP objects (with `id` and `name`)
      max_players_each_user_can_add: game.max_players_each_user_can_add
    };

    // Sending the game data as a JSON response
    res.json(gameDetails);
  } catch (error) {
    // Logging the error for debugging purposes
    console.error('Error fetching game details:', error);

    // Responding with a 500 status code in case of server error
    res.status(500).json({ message: 'An error occurred while fetching game details.' });
  }
});


//REGISTER PLAYERS API ---------------------------------------------

app.post('/api/register-players', authenticateToken, async (req, res) => {
  const { playersIds, gameId, userId } = req.body;
  try {
    // Prepare an array of promises for inserting players
    const promises = playersIds.map(playerId => {
      return promiseQuery(
        'INSERT IGNORE INTO registrations_to_game (game_id, player_id, registered_by) VALUES (?, ?, ?)',
        [gameId, playerId, userId]
      );
    });

    // Execute all promises concurrently
    await Promise.all(promises);

    res.status(200).send(`${playersIds.length} players registered successfully`);
  } catch (error) {
    console.error('Error registering players:', error);
    res.status(500).send('Error registering players');
  }
});






/* FETCH registered playeyrs for a GAME API ----------------------------------------------*/
app.get('/api/game_registrations/:game_id', authenticateToken, async (req, res) => {
  const gameId = req.params.game_id;

  try {
    // Query to fetch all registrations for the specified game
    const { results } = await promiseQuery(
      `SELECT rtg.*, p.name AS playerName, p.user_fk AS playerUserId, p.priority 
      FROM registrations_to_game AS rtg
      JOIN players AS p ON rtg.player_id = p.id
      WHERE rtg.game_id = ?
      ORDER BY p.priority DESC, rtg.registration_time ASC`,
      [gameId]
    );

    // Check if any game was found
    if (results.length === 0) {
      return res.status(404).json({ message: 'No registrations found for this game' });
    }

    const registrations = results.map(r => ({
      registration_id: r.registration_id,
      gameId: r.game_id,
      playerId: r.player_id,
      playerUserId: r.playerUserId,
      playerName: r.playerName,
      registered_by: r.registered_by,
      registrationDate: r.registration_time,
      approved: r.approved,
      priority: r.priority,

    }));

    res.json(registrations); // Return the registrations as JSON
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching registrations');
  }
});



//-----------CHECK IF CAN REGISTER MORE PLAYERS TO THE GAME-----//
app.get('/api/can-register-players-to-game/:game_id/:user_id', authenticateToken, async (req, res) => {
  const gameId = req.params.game_id;
  const userId = req.params.user_id;

  if (!gameId || !userId) {
    return res.status(400).send('Game ID and User ID are required');
  }

  try {
    // Query to count the number of players registered by the user for the specified game
    const { results } = await promiseQuery(
      'SELECT COUNT(*) AS playerCount FROM registrations_to_game WHERE game_id = ? AND registered_by = ?',
      [gameId, userId]
    );

    const playerCount = results[0].playerCount;

    res.status(200).json({
      message: 'User can register more players',
      playerCount,
    });
  } catch (error) {
    console.error('Error checking registration:', error);
    res.status(500).send('Error checking registration');
  }
});


/* DELETE player registration from a game ----------------------------------------------*/
app.delete('/api/game_registrations_deletion/:game_id/:player_id', authenticateToken, async (req, res) => {
  const { game_id, player_id } = req.params;

  try {
    // Query to delete the registration for the specified game and player
    const { results } = await promiseQuery(
      `DELETE FROM registrations_to_game WHERE game_id = ? AND player_id = ?`,
      [game_id, player_id]
    );

    // Check if the deletion was successful
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Registration not found for this game and player' });
    }

    res.json({ message: 'Player registration deleted successfully' }); // Return success message
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting player registration');
  }
});

//-----------------------------------------------------------------------------------------------

// Approve registration endpoint
app.post('/api/approve_registration', authenticateToken, async (req, res) => {
  const { registration_id } = req.body; // Get the registration ID from the request body

  try {
    // Update the registration_to_game to approved (set approved = 1) where registrationId matches
    const { results } = await promiseQuery(
      `UPDATE registrations_to_game 
       SET approved = 1 
       WHERE registration_id = ?`,
      [registration_id]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    res.status(200).json({ message: 'Registration approved successfully' });
  } catch (error) {
    console.error('Error approving registration:', error);
    res.status(500).send('Failed to approve registration');
  }
});

//-----------------------------------------------------------------------------------------------

// Add or update teams for a game
app.post('/api/game_teams', authenticateToken, async (req, res) => {
  try {
    const { game_id, teams } = req.body; // `teams` is an array of arrays, where each inner array is a team of player_ids

    // Validate input
    if (!game_id || !Array.isArray(teams) || teams.length === 0) {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    // Start a transaction to ensure all or nothing in the database changes
    await promiseQuery('START TRANSACTION');

    // First, delete any existing teams for the given game_id
    await promiseQuery('DELETE FROM game_teams WHERE game_fk = ?', [game_id]);

    // Insert each team as a new entry in the database
    for (const team of teams) {
      const teamJson = JSON.stringify(team); // Convert team array to JSON
      await promiseQuery('INSERT INTO game_teams (game_fk, team) VALUES (?, ?)', [game_id, teamJson]);
    }

    // Commit the transaction
    await promiseQuery('COMMIT');

    res.status(201).json({ message: 'Teams updated successfully' });
  } catch (error) {
    console.error(error);

    // Roll back transaction in case of error
    await promiseQuery('ROLLBACK');
    res.status(500).send('Error updating teams');
  }
});


// Get teams for a game
app.get('/api/get_game_teams/:game_id', authenticateToken, async (req, res) => {
  const { game_id } = req.params;

  try {
    // Fetch teams for the game and join with player names
    const { results } = await promiseQuery(`
      SELECT JSON_EXTRACT(gt.team, '$.playerIds') AS player_ids 
      FROM game_teams gt
      WHERE gt.game_fk = ?;
    `, [game_id]);

    // Parse player_ids for each row
    const parsedResults = results.map(row => ({
      player_ids: JSON.parse(row.player_ids)  // Make sure it's parsed into an array
    }));

    res.status(200).json(parsedResults);  // Send parsed results

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching teams' });
  }
});

/*------------------------------------------------------------------------------------*/
// MVP Vote endpoint
app.post('/api/mvp-vote', authenticateToken, async (req, res) => {
  const { game_id, voter_user_id, mvp_player_id } = req.body;

  if (!game_id || !mvp_player_id) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    // Check if a vote already exists for the user in this game
    const { results: existingVote } = await promiseQuery(
      'SELECT vote_id FROM mvp_votes WHERE game_id = ? AND voter_user_id = ?',
      [game_id, voter_user_id]
    );

    if (existingVote.length > 0) {
      // Update existing vote
      await promiseQuery(
        'UPDATE mvp_votes SET mvp_player_id = ? WHERE game_id = ? AND voter_user_id = ?',
        [mvp_player_id, game_id, voter_user_id]
      );
    } else {
      // Insert new vote
      await promiseQuery(
        'INSERT INTO mvp_votes (game_id, voter_user_id, mvp_player_id) VALUES (?, ?, ?)',
        [game_id, voter_user_id, mvp_player_id]
      );
    }

    res.status(200).json({ message: 'Vote successfully recorded.' });
  } catch (error) {
    console.error('Error updating or creating vote:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});



//-----------------------------------------------------------------------------------------------

// MVP Votes endpoint to decide who is the MVP
app.post('/api/mvp-votes/:game_id', authenticateToken, async (req, res) => {
  try {
    const gameId = req.params.game_id;

    // Query to count votes for each player in the game
    const { results } = await promiseQuery(
      `SELECT mvp_player_id, COUNT(*) AS vote_count
       FROM mvp_votes
       WHERE game_id = ?
       GROUP BY mvp_player_id
       ORDER BY vote_count DESC`,
      [gameId]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: 'No votes found for this game' });
    }

    // Determine the maximum vote count
    const maxVoteCount = results[0].vote_count;

    // Filter out players who have the maximum vote count (to handle ties)
    const mvpPlayers = results
      .filter(player => player.vote_count === maxVoteCount)
      .map(player => player.mvp_player_id); // Ensure correct field is referenced

    // Update the games table with the new MVPs
    const mvpsJson = JSON.stringify(mvpPlayers);
    await promiseQuery(
      `UPDATE games
       SET mvps = ?
       WHERE game_id = ?`,
      [mvpsJson, gameId]
    );

    // Update players' num_of_mvps for each MVP player
    for (const playerId of mvpPlayers) {
      await promiseQuery(
        `UPDATE players
             SET num_of_mvps = COALESCE(num_of_mvps, 0) + 1
             WHERE id = ?`,
        [playerId]
      );
    }

    // Send back the MVP players (could be one or more in case of ties)
    res.json({ mvpPlayers, maxVoteCount });
  } catch (error) {
    console.error('Error fetching or updating MVP votes:', error);
    res.status(500).send('Error fetching MVP votes');
  }
});

//-----------------------------------------------------------------------------------------------


// Delete Game endpoint
app.delete('/api/delete_game/:game_id', authenticateToken, async (req, res) => {
  const gameId = req.params.game_id;

  try {
    // Start a transaction to ensure all deletes succeed or none do
    await promiseQuery('START TRANSACTION');

    // Delete from mvp_votes table
    await promiseQuery('DELETE FROM mvp_votes WHERE game_id = ?', [gameId]);

    // Delete from player_game_statistics table
    await promiseQuery('DELETE FROM player_game_statistics WHERE game_id = ?', [gameId]);

    // Delete from game_teams table
    await promiseQuery('DELETE FROM game_teams WHERE game_fk = ?', [gameId]);

    // Delete from registrations_to_game table
    await promiseQuery('DELETE FROM registrations_to_game WHERE game_id = ?', [gameId]);

    // Finally, delete the game itself
    const { results } = await promiseQuery('DELETE FROM games WHERE game_id = ?', [gameId]);

    if (results.affectedRows === 0) {
      await promiseQuery('ROLLBACK');
      return res.status(404).json({ message: 'Game not found' });
    }

    // If everything succeeded, commit the transaction
    await promiseQuery('COMMIT');
    res.status(200).json({ message: 'Game deleted successfully' });

  } catch (error) {
    // If anything failed, rollback the transaction
    await promiseQuery('ROLLBACK');
    console.error('Error deleting game:', error);
    res.status(500).json({ message: 'Error deleting game' });
  }
});


// ADD STAT
app.post('/api/add-player-stat', authenticateToken, async (req, res) => {
  const { creatorUserId, playerId, matchId, stat, gameday_id } = req.body;

  try {
    // Start a transaction
    await promiseQuery('START TRANSACTION');

    try {
      // Insert the stat
      const statResult = await promiseQuery(
        'INSERT INTO ballershuffleschema.match_stats (match_id, gameday_id, player_id, stat_type, created_by) VALUES (?, ?, ?, ?, ?)',
        [matchId, gameday_id, playerId, stat, creatorUserId]
      );

      // Get player's team number
      const teamResult = await promiseQuery(
        'SELECT team_number FROM ballershuffleschema.match_players WHERE match_id = ? AND player_id = ?',
        [matchId, playerId]
      );

      if (teamResult.results.length === 0) {
        throw new Error('Player not found in match');
      }

      const teamNumber = teamResult.results[0].team_number;
      let scoreToAdd = 0;

      // Calculate score based on stat type
      switch (stat) {
        case 2: // 2 pointer
          scoreToAdd = 2;
          break;
        case 3: // 3 pointer
          scoreToAdd = 3;
          break;
        case 7: // Goal (football)
          scoreToAdd = 1;
          break;
        default:
          scoreToAdd = 0;
      }

      // Update team score if necessary
      if (scoreToAdd > 0) {
        const scoreField = teamNumber === 1 ? 'team1_score' : 'team2_score';
        await promiseQuery(
          `UPDATE ballershuffleschema.matches 
           SET ${scoreField} = ${scoreField} + ? 
           WHERE match_id = ?`,
          [scoreToAdd, matchId]
        );
      }

      // Get updated match data
      const matchResult = await promiseQuery(
        'SELECT team1_score, team2_score FROM ballershuffleschema.matches WHERE match_id = ?',
        [matchId]
      );

      await promiseQuery('COMMIT');

      res.status(201).json({
        message: 'Stat added successfully',
        statId: statResult.results.insertId,
        team1Score: matchResult.results[0].team1_score,
        team2Score: matchResult.results[0].team2_score
      });

    } catch (error) {
      await promiseQuery('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error adding stat:', error);
    res.status(500).json({
      error: 'Error adding stat'
    });
  }
});

// GET STATS
app.get('/api/match-stats/:matchId', authenticateToken, async (req, res) => {
  try {
    const { results } = await promiseQuery(
      `SELECT 
        ms.match_stat_id as id,
        ms.match_id,
        ms.gameday_id as game_id,
        ms.player_id,
        ms.stat_type as stat,
        ms.created_by,
        ms.created_at,
        p.name as player_name,
        u.username as created_by_name
      FROM ballershuffleschema.match_stats ms
      JOIN ballershuffleschema.players p ON ms.player_id = p.id
      LEFT JOIN ballershuffleschema.users u ON ms.created_by = u.id
      WHERE ms.match_id = ?
      ORDER BY ms.created_at DESC`,
      [req.params.matchId]
    );
    res.json(results);
  } catch (error) {
    console.error('Error fetching match stats:', error);
    res.status(500).json({ error: 'Failed to fetch match stats' });
  }
});

// DELETE STAT
app.delete('/api/delete-stat/:statId', authenticateToken, async (req, res) => {
  const statId = req.params.statId;

  try {
    // Start a transaction
    await promiseQuery('START TRANSACTION');

    try {
      // Get stat details before deletion
      const { results: statDetails } = await promiseQuery(
        `SELECT ms.match_id, ms.stat_type, mp.team_number
         FROM ballershuffleschema.match_stats ms
         JOIN ballershuffleschema.match_players mp 
         ON ms.player_id = mp.player_id AND ms.match_id = mp.match_id
         WHERE ms.match_stat_id = ?`,
        [statId]
      );

      if (statDetails.length === 0) {
        throw new Error('Stat not found');
      }

      const { match_id, stat_type, team_number } = statDetails[0];
      let scoreToSubtract = 0;

      // Calculate score to subtract based on stat type
      switch (stat_type) {
        case 2: // 2 pointer
          scoreToSubtract = 2;
          break;
        case 3: // 3 pointer
          scoreToSubtract = 3;
          break;
        case 7: // Goal (football)
          scoreToSubtract = 1;
          break;
        default:
          scoreToSubtract = 0;
      }

      // Update team score if necessary
      if (scoreToSubtract > 0) {
        const scoreField = team_number === 1 ? 'team1_score' : 'team2_score';
        await promiseQuery(
          `UPDATE ballershuffleschema.matches 
           SET ${scoreField} = GREATEST(${scoreField} - ?, 0)
           WHERE match_id = ?`,
          [scoreToSubtract, match_id]
        );
      }

      // Delete the stat
      await promiseQuery(
        'DELETE FROM ballershuffleschema.match_stats WHERE match_stat_id = ?',
        [statId]
      );

      // Get updated match data
      const { results: matchResult } = await promiseQuery(
        'SELECT team1_score, team2_score FROM ballershuffleschema.matches WHERE match_id = ?',
        [match_id]
      );

      await promiseQuery('COMMIT');

      res.json({
        message: 'Stat deleted successfully',
        team1Score: matchResult[0].team1_score,
        team2Score: matchResult[0].team2_score
      });

    } catch (error) {
      await promiseQuery('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error deleting stat:', error);
    res.status(500).json({
      error: 'Error deleting stat'
    });
  }
});

// --------------------------Statistics endpoint that handles both basketball and football

app.get('/api/court-statistics/:courtId/:courtType', authenticateToken, async (req, res) => {
  try {
    const courtId = req.params.courtId;
    const courtType = req.params.courtType;

    let query;
    if (courtType === 'Basketball') {
      query = `
        SELECT 
          p.id as player_id,
          p.name as player_name,
          bcs.total_games_played,
          bcs.total_2pts,
          bcs.total_3pts,
          bcs.total_assists,
          bcs.total_steals,
          bcs.total_blocks,
          bcs.total_wins,
          (bcs.total_2pts * 2 + bcs.total_3pts * 3) as total_points,
          ROUND((bcs.total_2pts * 2 + bcs.total_3pts * 3) / NULLIF(bcs.total_games_played, 0), 1) as ppg,
          ROUND(bcs.total_assists / NULLIF(bcs.total_games_played, 0), 1) as apg,
          ROUND(bcs.total_steals / NULLIF(bcs.total_games_played, 0), 1) as spg,
          ROUND(bcs.total_blocks / NULLIF(bcs.total_games_played, 0), 1) as bpg,
          ROUND(bcs.total_3pts / NULLIF(bcs.total_games_played, 0), 1) as threeptpg
        FROM players p
        LEFT JOIN basketball_court_statistics bcs ON p.id = bcs.player_id
        WHERE p.courtId = ?
        ORDER BY total_points DESC`;
    } else {
      query = `
        SELECT 
          p.id as player_id,
          p.name as player_name,
          fcs.total_games_played,
          fcs.total_goals,
          fcs.total_assists,
          fcs.total_misses,
          fcs.total_wins,
          ROUND(fcs.total_goals / NULLIF(fcs.total_games_played, 0), 1) as gpg,
          ROUND(fcs.total_assists / NULLIF(fcs.total_games_played, 0), 1) as apg
        FROM players p
        LEFT JOIN football_court_statistics fcs ON p.id = fcs.player_id
        WHERE p.courtId = ?
        ORDER BY total_goals DESC`;
    }

    const { results } = await promiseQuery(query, [courtId]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'No statistics found for this court' });
    }

    res.json(results);
  } catch (error) {
    console.error('Error fetching court statistics:', error);
    res.status(500).send('Error fetching statistics');
  }
});

// ----------------------------------Update court statistics endpoint
app.post('/api/update-court-statistics/:gameId/:courtType', authenticateToken, async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const courtType = req.params.courtType;

    if (courtType === 'Basketball') {
      await promiseQuery(
        `INSERT INTO basketball_court_statistics (player_id, total_games_played, total_2pts, total_3pts, total_assists, total_steals, total_blocks, total_wins)
         SELECT
           bgs.player_id,
           1 AS total_games_played,
           IFNULL(SUM(bgs.total_2pts_today), 0) AS total_2pts,
           IFNULL(SUM(bgs.total_3pts_today), 0) AS total_3pts,
           IFNULL(SUM(bgs.total_assists_today), 0) AS total_assists,
           IFNULL(SUM(bgs.total_steals_today), 0) AS total_steals,
           IFNULL(SUM(bgs.total_blocks_today), 0) AS total_blocks,
           IFNULL(SUM(bgs.total_wins_today), 0) AS total_wins
         FROM ballershuffleschema.basketball_gameday_stats bgs
         WHERE bgs.gameday_id = ?
         GROUP BY bgs.player_id
         ON DUPLICATE KEY UPDATE
           total_games_played = total_games_played + 1,
           total_2pts = total_2pts + VALUES(total_2pts),
           total_3pts = total_3pts + VALUES(total_3pts),
           total_assists = total_assists + VALUES(total_assists),
           total_steals = total_steals + VALUES(total_steals),
           total_blocks = total_blocks + VALUES(total_blocks),
           total_wins = total_wins + VALUES(total_wins)`,
        [gameId]
      );
    } else {
      await promiseQuery(
        `INSERT INTO football_court_statistics (player_id, total_games_played, total_goals, total_assists, total_misses, total_wins)
         SELECT
           fgs.player_id,
           1 AS total_games_played,
           IFNULL(SUM(fgs.total_goals_today), 0) AS total_goals,
           IFNULL(SUM(fgs.total_assists_today), 0) AS total_assists,
           IFNULL(SUM(fgs.total_misses_today), 0) AS total_misses,
           IFNULL(SUM(fgs.total_wins_today), 0) AS total_wins
         FROM ballershuffleschema.football_gameday_stats fgs
         WHERE fgs.gameday_id = ?
         GROUP BY fgs.player_id
         ON DUPLICATE KEY UPDATE
           total_games_played = total_games_played + 1,
           total_goals = total_goals + VALUES(total_goals),
           total_assists = total_assists + VALUES(total_assists),
           total_misses = total_misses + VALUES(total_misses),
           total_wins = total_wins + VALUES(total_wins)`,
        [gameId]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating court statistics:', error);
    res.status(500).json({ error: 'Failed to update court statistics' });
  }
});

//-----------------------PLAYER STATS FOR EDIT PROFILE PAGE-------------------------------

app.get('/api/player-statistics/:playerId/:courtId', authenticateToken, async (req, res) => {
  try {
    const playerId = req.params.playerId;
    const courtId = req.params.courtId;

    // First, determine the court type
    const courtTypeQuery = `SELECT courtType FROM courts WHERE id = ?`;
    const { results: courtResults } = await promiseQuery(courtTypeQuery, [courtId]);

    if (!courtResults || courtResults.length === 0) {
      return res.status(404).send('Court not found');
    }

    const courtType = courtResults[0].courtType;

    let query;
    if (courtType === 'Football') {
      query = `
        SELECT 
          p.id as player_id,
          p.name as player_name,
          p.num_of_mvps,
          fcs.total_games_played,
          fcs.total_goals,
          fcs.total_assists,
          fcs.total_misses,
          fcs.total_wins,
          ROUND(fcs.total_goals / NULLIF(fcs.total_games_played, 0), 1) as gpg,
          ROUND(fcs.total_assists / NULLIF(fcs.total_games_played, 0), 1) as apg,
          ROUND(fcs.total_misses / NULLIF(fcs.total_games_played, 0), 1) as mpg
        FROM players p
        LEFT JOIN football_court_statistics fcs ON p.id = fcs.player_id
        WHERE p.id = ? AND p.courtId = ?`;
    } else {
      query = `
        SELECT 
          p.id as player_id,
          p.name as player_name,
          p.num_of_mvps,
          bcs.total_games_played,
          bcs.total_2pts,
          bcs.total_3pts,
          bcs.total_assists,
          bcs.total_steals,
          bcs.total_blocks,
          bcs.total_wins,
          (bcs.total_2pts * 2 + bcs.total_3pts * 3) as total_points,
          ROUND((bcs.total_2pts * 2 + bcs.total_3pts * 3) / NULLIF(bcs.total_games_played, 0), 1) as ppg,
          ROUND(bcs.total_assists / NULLIF(bcs.total_games_played, 0), 1) as apg,
          ROUND(bcs.total_steals / NULLIF(bcs.total_games_played, 0), 1) as spg,
          ROUND(bcs.total_blocks / NULLIF(bcs.total_games_played, 0), 1) as bpg,
          ROUND(bcs.total_3pts / NULLIF(bcs.total_games_played, 0), 1) as threeptpg
        FROM players p
        LEFT JOIN basketball_court_statistics bcs ON p.id = bcs.player_id
        WHERE p.id = ? AND p.courtId = ?`;
    }

    const { results } = await promiseQuery(query, [playerId, courtId]);

    if (!results || results.length === 0) {
      if (courtType === 'Football') {
        return res.json({
          total_games_played: 0,
          num_of_mvps: 0,
          total_goals: 0,
          total_assists: 0,
          total_misses: 0,
          total_wins: 0,
          gpg: 0,
          apg: 0,
          mpg: 0
        });
      } else {
        return res.json({
          total_games_played: 0,
          num_of_mvps: 0,
          total_2pts: 0,
          total_3pts: 0,
          total_assists: 0,
          total_steals: 0,
          total_blocks: 0,
          total_wins: 0,
          total_points: 0,
          ppg: 0,
          apg: 0,
          spg: 0,
          bpg: 0,
          threeptpg: 0
        });
      }
    }

    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching player statistics:', error);
    res.status(500).send('Error fetching statistics');
  }
});

//---------------------Insert Main Players to the table that stores the players that played-----
app.post('/api/game-players-that-played/:gameId', authenticateToken, async (req, res) => {
  try {
    const gameId = req.params.gameId;

    // First get the max_players from the game
    const { results: gameResults } = await promiseQuery(
      'SELECT max_players FROM games WHERE game_id = ?',
      [gameId]
    );

    if (!gameResults || gameResults.length === 0) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const maxPlayers = gameResults[0].max_players;

    // Get the main players (up to max_players) ordered by registration time
    const { results: playerResults } = await promiseQuery(
      `SELECT player_id 
       FROM registrations_to_game 
       WHERE game_id = ? 
       ORDER BY registration_time 
       LIMIT ?`,
      [gameId, maxPlayers]
    );

    if (!playerResults || playerResults.length === 0) {
      return res.status(404).json({ message: 'No players found' });
    }

    // Insert records into game_players_played
    const values = playerResults.map(player => [gameId, player.player_id]);
    const insertQuery = 'INSERT INTO game_players_played (game_id, player_id) VALUES ?';

    await promiseQuery(insertQuery, [values]);

    res.json({ message: 'Players added successfully to game_players_played' });
  } catch (error) {
    console.error('Error creating game_players_played records:', error);
    res.status(500).json({ message: 'Error creating game players played records' });
  }
});

//-------------------Games player played---

app.get('/api/player-games/:playerId/:courtId', authenticateToken, async (req, res) => {
  try {
    const playerId = req.params.playerId;
    const courtId = req.params.courtId;

    const query = `
      SELECT 
        g.game_id,
        g.game_start_time,
        g.location
      FROM games g
      INNER JOIN game_players_played gpp ON g.game_id = gpp.game_id
      WHERE gpp.player_id = ? 
      AND g.court_id = ?
      ORDER BY g.game_start_time DESC`;

    const { results } = await promiseQuery(query, [playerId, courtId]);

    // Format the data to match your frontend expectations
    const formattedGames = results.map(game => ({
      game_id: game.game_id,
      start_date: game.game_start_time,
      location: game.location
    }));

    res.json(formattedGames);
  } catch (error) {
    console.error('Error fetching player games:', error);
    res.status(500).send('Error fetching games');
  }
});

//Create a new Match API

// Create Match Endpoint
app.post('/api/create_match/:gameday_id/:created_by', authenticateToken, async (req, res) => {
  const gameday_id = req.params.gameday_id;
  const created_by = req.params.created_by;
  const { team1_players, team2_players } = req.body;

  try {
    // Validate teams
    if (!team1_players || !team2_players || team1_players.length === 0 || team2_players.length === 0) {
      return res.status(400).json({
        error: 'Both teams must have players'
      });
    }

    if (team1_players.length !== team2_players.length) {
      return res.status(400).json({
        error: 'Teams must have equal number of players'
      });
    }

    // First query: Insert into "matches" table
    const insertMatchResult = await promiseQuery(
      'INSERT INTO ballershuffleschema.matches (gameday_id, team1_score, team2_score, match_status, created_by) VALUES (?, 0, 0, "in_progress", ?)',
      [gameday_id, created_by]
    );

    const match_id = insertMatchResult.results.insertId;

    // Insert team 1 players
    const team1Values = team1_players.map(playerId => [match_id, playerId, 1]);
    await promiseQuery(
      'INSERT INTO ballershuffleschema.match_players (match_id, player_id, team_number) VALUES ?',
      [team1Values]
    );

    // Insert team 2 players
    const team2Values = team2_players.map(playerId => [match_id, playerId, 2]);
    await promiseQuery(
      'INSERT INTO ballershuffleschema.match_players (match_id, player_id, team_number) VALUES ?',
      [team2Values]
    );

    res.status(201).json({
      message: 'Match created successfully',
      match_id: match_id
    });

  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({
      error: 'Error creating match'
    });
  }
});


// Get Match Players Endpoint
app.get('/api/match_players/:match_id', authenticateToken, async (req, res) => {
  const match_id = req.params.match_id;

  try {
    const { results } = await promiseQuery(
      `SELECT 
        mp.player_id,
        mp.team_number,
        p.name,
        p.user_fk,
        p.creator_user_fk,
        CASE 
          WHEN bpa.overall IS NOT NULL THEN bpa.overall
          WHEN fpa.overall IS NOT NULL THEN fpa.overall
          ELSE NULL
        END as overall
      FROM ballershuffleschema.match_players mp
      JOIN ballershuffleschema.players p ON mp.player_id = p.id
      LEFT JOIN ballershuffleschema.basketball_player_attributes bpa ON p.id = bpa.playerId
      LEFT JOIN ballershuffleschema.football_player_attributes fpa ON p.id = fpa.playerId
      WHERE mp.match_id = ?
      ORDER BY mp.team_number, p.name`,
      [match_id]
    );

    if (results.length === 0) {
      return res.status(404).json({
        error: 'No players found for this match'
      });
    }

    res.json(results);

  } catch (error) {
    console.error('Error getting match players:', error);
    res.status(500).json({
      error: 'Error retrieving match players'
    });
  }
});

// Get Match Details Endpoint
app.get('/api/match/:match_id', authenticateToken, async (req, res) => {
  const match_id = req.params.match_id;

  try {
    const { results } = await promiseQuery(
      `SELECT 
        m.match_id,
        m.gameday_id,
        m.team1_score,
        m.team2_score,
        m.match_status,
        m.created_by,
        m.created_at,
        m.completed_at,
        g.game_start_time,
        g.court_id,
        c.courtType as court_type
      FROM ballershuffleschema.matches m
      JOIN ballershuffleschema.games g ON m.gameday_id = g.game_id
      JOIN ballershuffleschema.courts c ON g.court_id = c.id
      WHERE m.match_id = ?`,
      [match_id]
    );

    if (results.length === 0) {
      return res.status(404).json({
        error: 'Match not found'
      });
    }

    // Return the first (and should be only) result
    res.json(results[0]);

  } catch (error) {
    console.error('Error getting match details:', error);
    res.status(500).json({
      error: 'Error retrieving match details'
    });
  }
});


// Get Matches for Gameday Endpoint
app.get('/api/gameday_matches/:gameday_id', authenticateToken, async (req, res) => {
  const gameday_id = req.params.gameday_id;

  try {
    const { results } = await promiseQuery(
      `SELECT 
        match_id,
        team1_score,
        team2_score,
        match_status,
        created_at,
        completed_at
      FROM ballershuffleschema.matches
      WHERE gameday_id = ?
      ORDER BY created_at DESC`,
      [gameday_id]
    );

    res.json(results);

  } catch (error) {
    console.error('Error getting gameday matches:', error);
    res.status(500).json({
      error: 'Error retrieving gameday matches'
    });
  }
});


//END MATCH API
app.post('/api/end-match/:matchId', authenticateToken, async (req, res) => {
  const matchId = req.params.matchId;
  const { winningTeam } = req.body;

  try {
    await promiseQuery('START TRANSACTION');

    try {
      // First check if match is already completed
      const { results: matchStatus } = await promiseQuery(
        `SELECT match_status, gameday_id 
         FROM ballershuffleschema.matches 
         WHERE match_id = ?`,
        [matchId]
      );

      if (matchStatus[0].match_status === 'completed') {
        await promiseQuery('ROLLBACK');
        return res.status(409).json({
          message: 'Match is already completed'
        });
      }

      const gameday_id = matchStatus[0].gameday_id;

      // Update match status to completed
      await promiseQuery(
        `UPDATE ballershuffleschema.matches 
         SET match_status = 'completed', 
             completed_at = NOW() 
         WHERE match_id = ?`,
        [matchId]
      );

      // Get the match type
      const { results: matchDetails } = await promiseQuery(
        `SELECT c.courtType
         FROM ballershuffleschema.matches m
         JOIN ballershuffleschema.games g ON m.gameday_id = g.game_id
         JOIN ballershuffleschema.courts c ON g.court_id = c.id
         WHERE m.match_id = ?`,
        [matchId]
      );

      const courtType = matchDetails[0].courtType;

      if (courtType === 'Basketball') {
        // Basketball stats update
        await promiseQuery(
          `INSERT INTO ballershuffleschema.basketball_gameday_stats 
           (player_id, gameday_id, total_matches_today, total_2pts_today, total_3pts_today, 
            total_assists_today, total_steals_today, total_blocks_today, total_wins_today)
           SELECT 
             mp.player_id,
             ? as gameday_id,
             1 AS total_matches_today,
             SUM(CASE WHEN ms.stat_type = 2 THEN 1 ELSE 0 END) AS total_2pts_today,
             SUM(CASE WHEN ms.stat_type = 3 THEN 1 ELSE 0 END) AS total_3pts_today,
             SUM(CASE WHEN ms.stat_type = 4 THEN 1 ELSE 0 END) AS total_assists_today,
             SUM(CASE WHEN ms.stat_type = 6 THEN 1 ELSE 0 END) AS total_steals_today,
             SUM(CASE WHEN ms.stat_type = 5 THEN 1 ELSE 0 END) AS total_blocks_today,
             CASE 
               WHEN team_number = ? AND ? > 0 THEN 1 
               ELSE 0 
             END AS total_wins_today
           FROM ballershuffleschema.match_players mp
           LEFT JOIN ballershuffleschema.match_stats ms 
             ON mp.match_id = ms.match_id AND mp.player_id = ms.player_id
           WHERE mp.match_id = ?
           GROUP BY mp.player_id, mp.team_number
           ON DUPLICATE KEY UPDATE
             total_matches_today = basketball_gameday_stats.total_matches_today + 1,
             total_2pts_today = basketball_gameday_stats.total_2pts_today + VALUES(total_2pts_today),
             total_3pts_today = basketball_gameday_stats.total_3pts_today + VALUES(total_3pts_today),
             total_assists_today = basketball_gameday_stats.total_assists_today + VALUES(total_assists_today),
             total_steals_today = basketball_gameday_stats.total_steals_today + VALUES(total_steals_today),
             total_blocks_today = basketball_gameday_stats.total_blocks_today + VALUES(total_blocks_today),
             total_wins_today = basketball_gameday_stats.total_wins_today + VALUES(total_wins_today)`,
          [gameday_id, winningTeam, winningTeam, matchId]
        );
      } else {
        // Football stats update
        await promiseQuery(
          `INSERT INTO ballershuffleschema.football_gameday_stats 
           (player_id, gameday_id, total_matches_today, total_goals_today, total_assists_today, 
            total_misses_today, total_wins_today)
           SELECT 
             mp.player_id,
             ? as gameday_id,
             1 AS total_matches_today,
             SUM(CASE WHEN ms.stat_type = 7 THEN 1 ELSE 0 END) AS total_goals_today,
             SUM(CASE WHEN ms.stat_type = 8 THEN 1 ELSE 0 END) AS total_assists_today,
             SUM(CASE WHEN ms.stat_type = 9 THEN 1 ELSE 0 END) AS total_misses_today,
             CASE 
               WHEN team_number = ? AND ? > 0 THEN 1 
               ELSE 0 
             END AS total_wins_today
           FROM ballershuffleschema.match_players mp
           LEFT JOIN ballershuffleschema.match_stats ms 
             ON mp.match_id = ms.match_id AND mp.player_id = ms.player_id
           WHERE mp.match_id = ?
           GROUP BY mp.player_id, mp.team_number
           ON DUPLICATE KEY UPDATE
             total_matches_today = football_gameday_stats.total_matches_today + 1,
             total_goals_today = football_gameday_stats.total_goals_today + VALUES(total_goals_today),
             total_assists_today = football_gameday_stats.total_assists_today + VALUES(total_assists_today),
             total_misses_today = football_gameday_stats.total_misses_today + VALUES(total_misses_today),
             total_wins_today = football_gameday_stats.total_wins_today + VALUES(total_wins_today)`,
          [gameday_id, winningTeam, winningTeam, matchId]
        );
      }

      await promiseQuery('COMMIT');

      res.json({
        message: 'Match ended successfully and statistics updated'
      });

    } catch (error) {
      await promiseQuery('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error ending match:', error);
    res.status(500).json({
      error: 'Error ending match'
    });
  }
});



// Get Basketball Gameday Stats API
app.get('/api/basketball_gameday_stats/:gameId', authenticateToken, async (req, res) => {
  const gameId = req.params.gameId;

  try {
    const { results } = await promiseQuery(
      `SELECT 
        bgs.player_id,
        p.name as player_name,
        bgs.total_matches_today,
        bgs.total_2pts_today,
        bgs.total_3pts_today,
        bgs.total_assists_today,
        bgs.total_steals_today,
        bgs.total_blocks_today,
        bgs.total_wins_today
      FROM ballershuffleschema.basketball_gameday_stats bgs
      JOIN ballershuffleschema.players p ON bgs.player_id = p.id
      WHERE bgs.gameday_id = ?
      ORDER BY (bgs.total_2pts_today * 2 + bgs.total_3pts_today * 3) DESC`,
      [gameId]
    );

    if (results.length === 0) {
      // If no stats found, return empty array instead of error
      return res.json([]);
    }

    // Add calculated fields if needed
    const statsWithCalculations = results.map(stat => ({
      ...stat,
      total_points: (stat.total_2pts_today * 2) + (stat.total_3pts_today * 3)
    }));

    res.json(statsWithCalculations);

  } catch (error) {
    console.error('Error fetching basketball gameday stats:', error);
    res.status(500).json({
      error: 'Failed to fetch basketball gameday statistics'
    });
  }
});

// Get Football Gameday Stats API
app.get('/api/football_gameday_stats/:gameId', authenticateToken, async (req, res) => {
  const gameId = req.params.gameId;

  try {
    const { results } = await promiseQuery(
      `SELECT 
        fgs.player_id,
        p.name as player_name,
        fgs.total_matches_today,
        fgs.total_goals_today,
        fgs.total_assists_today,
        fgs.total_misses_today,
        fgs.total_wins_today
      FROM ballershuffleschema.football_gameday_stats fgs
      JOIN ballershuffleschema.players p ON fgs.player_id = p.id
      WHERE fgs.gameday_id = ?
      ORDER BY fgs.total_goals_today DESC`,
      [gameId]
    );

    if (results.length === 0) {
      // If no stats found, return empty array instead of error
      return res.json([]);
    }

    // Add any calculated fields if needed here
    const statsWithCalculations = results.map(stat => ({
      ...stat,
      efficiency: stat.total_goals_today / (stat.total_goals_today + stat.total_misses_today || 1)
    }));

    res.json(statsWithCalculations);

  } catch (error) {
    console.error('Error fetching football gameday stats:', error);
    res.status(500).json({
      error: 'Failed to fetch football gameday statistics'
    });
  }
});
