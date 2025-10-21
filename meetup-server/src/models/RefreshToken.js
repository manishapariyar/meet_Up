import pool from '../config/database.js';

const find = async (refresh_token) => {
  const query = `SELECT user_id FROM refresh_tokens WHERE token = ?`
  const result = await pool.query(
    query, [refresh_token]
  );
  return result[0];
}

const save = async (user_id, refresh_token) => {
  const query = `INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)`
  const [result] = await pool.query(
    query, [user_id, refresh_token]
  );
  return result;
}

const update = async (user_id, oldRefreshToken, newRefreshToken) => {
  const query = `UPDATE refresh_tokens SET token = ? WHERE user_id = ? AND token = ?`

  const [result] = await pool.query(
    query, [newRefreshToken, user_id, oldRefreshToken]
  )
  return result;
}

const revoke = async (refresh_token) => {
  const query = `DELETE FROM refresh_tokens WHERE token = ?`
  const [result] = await pool.query(
    query, [refresh_token]
  )
  return result;
}


export {
  find,
  save,
  update,
  revoke
}