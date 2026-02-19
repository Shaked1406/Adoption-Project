const db = require("../util/database");

async function run(sql, params = []) {
  if (db && typeof db.query === "function") {
    return db.query(sql, params);
  }
  if (db && typeof db.execute === "function") {
    return db.execute(sql, params);
  }
  throw new TypeError(
    "Database object does not expose query/execute. Check ../util/database export."
  );
}

async function getShelters() {
  const [rows] = await run(
    "SELECT shelter_id, name AS shelter_name FROM shelters ORDER BY name"
  );
  return rows;
}

async function createDogSubmission(values) {
  await run(
    `INSERT INTO DogSubmissions (
      submitter_full_name, submitter_phone, submitter_email,
      dog_name, dog_age_years, dog_breed, dog_size, dog_gender, dog_description,
      preferred_shelter_id, image_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      values.submitter_full_name,
      values.submitter_phone,
      values.submitter_email,
      values.dog_name,
      values.dog_age_years,
      values.dog_breed,
      values.dog_size,
      values.dog_gender,
      values.dog_description,
      values.preferred_shelter_id,
      values.image_url,
    ]
  );
}

module.exports = {
  getShelters,
  createDogSubmission,
};
