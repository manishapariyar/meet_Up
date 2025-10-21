import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet'
import authRoute from './routes/authRoute.js';


const app = express();


const corOptions = {
  origin: process.env.REACT_APP_URL,
  credentials: true,

}

dotenv.config();
app.use(express.json());

app.use(cors(corOptions))
app.use(helmet());

app.use('/api/auth', authRoute)
app.get('/', (req, res) => {
  res.send('Welcome to the Meetup Server!');
});


export default app;
