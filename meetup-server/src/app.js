import express from 'express';
import cors from 'cors';

import pool from './config/database.js';
import helmet from 'helmet'


const app = express();


const corOptions = {
  origin: process.env.REACT_APP_URL,
  credentials: true,

}


app.use(express.json());

app.use(cors(corOptions))
app.use(helmet());

app.get('/users', (req, res) => {
  pool.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
app.get('/', (req, res) => {
  res.send('Welcome to the Meetup Server!');
});


export default app;
