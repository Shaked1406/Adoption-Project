// models/shelterAuthModel.js
const db = require("../util/database");


async function findUserByEmail(email) {
  const [rows] = await db.query(
    "SELECT user_id, email, password_hash FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  return rows[0] || null;
}

async function createUser(email, passwordHash) {
  const [result] = await db.query(
    "INSERT INTO users (email, password_hash) VALUES (?, ?)",
    [email, passwordHash]
  );
  return result.insertId;
}


async function linkShelterToUser(shelterId, userId) {
  const [result] = await db.query(
    "UPDATE shelters SET user_id = ? WHERE shelter_id = ?",
    [userId, shelterId]
  );
  return result.affectedRows; 
}

async function findShelterByUserId(userId) {
  const [rows] = await db.query(
    "SELECT shelter_id, name FROM shelters WHERE user_id = ? LIMIT 1",
    [userId]
  );
  return rows[0] || null;
}

async function findShelterUserByEmail(email) {
  const [rows] = await db.query(
    `
    SELECT 
      u.user_id,
      u.email,
      u.password_hash,
      s.shelter_id,
      s.name AS shelter_name
    FROM users u
    INNER JOIN shelters s ON s.user_id = u.user_id
    WHERE u.email = ?
    LIMIT 1
    `,
    [email]
  );

  return rows[0] || null;
}

module.exports = {
  findUserByEmail,
  createUser,
  linkShelterToUser,
  findShelterByUserId,
  findShelterUserByEmail,
};
