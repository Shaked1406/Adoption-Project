// models/sheltersModel.js
const db = require("../util/database");

async function getAllShelters() {
  const [rows] = await db.query(
    "SELECT name, city, phone, hp, website FROM shelters ORDER BY name"
  );
  return rows;
}

module.exports = { getAllShelters };
