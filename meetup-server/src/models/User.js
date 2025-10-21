
import pool from '../config/database.js';
const findByUsername = async (username) => {
  const query = `SELECT user_id, username, email, password FROM users WHERE username = ? AND status = 1`
  const result = await pool.query(query, [username]);
  return result[0];
}




const createUser = async (username, email, hashedPassword) => {
  const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`
  const [result] = await pool.query(query, [username, email, hashedPassword]);
  return result;
}
export {
  findByUsername
  , createUser
}