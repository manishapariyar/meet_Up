import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

// Create a regular pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Wrap the pool with promises
const promisePool = pool.promise();

// Test the connection
async function testConnection() {
  try {
    const connection = await promisePool.getConnection();
    console.log('Connected to the database.');
    connection.release();
  } catch (err) {
    console.error('Error connecting to the database:', err);
  }
}

testConnection();

export default promisePool;
