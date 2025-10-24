
import pool from '../config/database.js';
const findByUsername = async (username) => {
  const query = `SELECT id AS user_id, username, email, password FROM users WHERE username = ?`;
  const [rows] = await pool.query(query, [username]);
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