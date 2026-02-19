// models/dogsModel.js
const db = require("../util/database");

function sanitizeFilters(raw = {}) {
  const allowedSizes = new Set(["Small", "Medium", "Large"]);
  const allowedGenders = new Set(["Male", "Female"]);
  const allowedAges = new Set(["puppy", "young", "adult", "senior"]);

  return {
    size: allowedSizes.has(raw.size) ? raw.size : "",
    gender: allowedGenders.has(raw.gender) ? raw.gender : "",
    age: allowedAges.has(raw.age) ? raw.age : "",
  };
}

async function getAvailableDogs(rawFilters = {}) {
  const filters = sanitizeFilters(rawFilters);

  let sql = `
    SELECT
      d.dog_id,
      d.dog_name,
      d.age_years,
      d.breed,
      d.size,
      d.gender,
      d.short_description,
      d.image_url,
      s.name AS shelter_name
    FROM Dogs d
    JOIN Shelters s ON s.shelter_id = d.shelter_id
    WHERE d.is_available = 1
  `;

  const params = [];

  if (filters.size) {
    sql += " AND d.size = ?";
    params.push(filters.size);
  }

  if (filters.gender) {
    sql += " AND d.gender = ?";
    params.push(filters.gender);
  }

  if (filters.age) {
    switch (filters.age) {
      case "puppy":
        sql += " AND d.age_years <= 1";
        break;
      case "young":
        sql += " AND d.age_years > 1 AND d.age_years <= 3";
        break;
      case "adult":
        sql += " AND d.age_years > 3 AND d.age_years <= 7";
        break;
      case "senior":
        sql += " AND d.age_years > 7";
        break;
    }
  }

  sql += " ORDER BY d.created_at DESC";

  const [rows] = await db.query(sql, params);
  return rows;
}

module.exports = { getAvailableDogs };
