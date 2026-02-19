const pool = require("../util/database");

async function getShelterIdByDogId(dogId) {
  const [rows] = await pool.query(
    "SELECT shelter_id FROM dogs WHERE dog_id = ?",
    [dogId]
  );
  return rows[0]?.shelter_id ?? null;
}

async function createAdoptionRequest({ dog_id, full_name, phone, email, city, additional_notes }) {
  const shelter_id = await getShelterIdByDogId(dog_id);

  if (!shelter_id) {
    throw new Error("Dog has no shelter_id (cannot create adoption request).");
  }

  const [result] = await pool.query(
    `INSERT INTO adoptionrequests
      (shelter_id, dog_id, full_name, phone, email, city, additional_notes, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [shelter_id, dog_id, full_name, phone, email, city || null, additional_notes || null]
  );

  return result.insertId;
}

module.exports = {
  createAdoptionRequest,
};
