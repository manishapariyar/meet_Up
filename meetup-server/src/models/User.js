
import pool from '../config/database.js';
const findByUsername = async (email) => {
  const query = `SELECT id AS user_id, email, password FROM users WHERE email = ?`;
  const [rows] = await pool.query(query, [email]);
  return rows;
};

const createUser = async (username, email, hashedPassword) => {
  const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`
  const [result] = await pool.query(query, [username, email, hashedPassword]);
  return result;
}
export {
  findByUsername
  , createUser
}