const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');

const app = express();

app.use(express.json());

const cors = require('cors');
app.use(cors());

require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;

const promiseQuery = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results, fields) => {
      if (err) {
        reject(err);
      } else {
        resolve({ results, fields });
      }
    });
  });
}




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




 // Login endpoint
 app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const { results } = await promiseQuery('SELECT * FROM users WHERE username = ?', [username]);
    if (results.length === 0) {
      return res.status(404).send('User not found');
    }
    console.log(results);
    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (passwordMatch) {
      console.log(user);
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


// Courts endpoint
app.get('/api/courts/:id', async (req, res) => {
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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
