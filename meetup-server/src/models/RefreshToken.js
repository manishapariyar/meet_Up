import pool from '../config/database.js';

// Find a refresh token
const find = async (refresh_token) => {
  const query = `SELECT user_id FROM refresh_tokens WHERE refresh_token = ?`;
  const [rows] = await pool.query(query, [refresh_token]);
  return rows;
}

// Save a new refresh token
const save = async (user_id, refresh_token) => {
  const query = `INSERT INTO refresh_tokens (user_id, refresh_token) VALUES (?, ?)`;
  const [result] = await pool.query(query, [user_id, refresh_token]);
  return result;
}

// Update an existing refresh token
const update = async (user_id, oldRefreshToken, newRefreshToken) => {
  const query = `UPDATE refresh_tokens SET refresh_token = ? WHERE user_id = ? AND refresh_token = ?`;
  const [result] = await pool.query(query, [newRefreshToken, user_id, oldRefreshToken]);
  return result;
}

// Delete a refresh token (logout)
const revoke = async (refresh_token) => {
  const query = `DELETE FROM refresh_tokens WHERE refresh_token = ?`;
  const [result] = await pool.query(query, [refresh_token]);
  return result;
}

export {
  find,
  save,
  update,
  revoke
}
