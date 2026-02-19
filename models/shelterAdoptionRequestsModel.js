// models/shelterAdoptionRequestsModel.js
const db = require("../util/database");

exports.getRequestsByShelterId = async (shelterId) => {
  const [rows] = await db.query(
    `
    SELECT 
      ar.request_id,
      ar.full_name,
      ar.phone,
      ar.email,
      ar.city,
      ar.created_at,
      ar.status,
      d.dog_id,
      d.dog_name AS dog_name
    FROM adoptionrequests ar
    INNER JOIN dogs d ON d.dog_id = ar.dog_id
    WHERE ar.shelter_id = ?
    ORDER BY ar.created_at DESC
    `,
    [shelterId]
  );

  return rows;
};

exports.getRequestByIdAndShelterId = async (requestId, shelterId) => {
  const [rows] = await db.query(
    `
    SELECT request_id, dog_id
    FROM adoptionrequests
    WHERE request_id = ? AND shelter_id = ?
    LIMIT 1
    `,
    [requestId, shelterId]
  );

  return rows[0] || null;
};

exports.approveRequest = async (requestId, dogId, shelterId) => {
  if (typeof db.getConnection === "function") {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query(
        `DELETE FROM adoptionrequests WHERE request_id = ? AND shelter_id = ?`,
        [requestId, shelterId]
      );

      // CHANGED: do not delete the dog; mark it as unavailable instead
      await conn.query(
        `UPDATE Dogs SET is_available = 0 WHERE dog_id = ? AND shelter_id = ?`,
        [dogId, shelterId]
      );

      await conn.commit();
      return;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  await db.query(
    `DELETE FROM adoptionrequests WHERE request_id = ? AND shelter_id = ?`,
    [requestId, shelterterId]
  );

  // CHANGED: do not delete the dog; mark it as unavailable instead
  await db.query(
    `UPDATE Dogs SET is_available = 0 WHERE dog_id = ? AND shelter_id = ?`,
    [dogId, shelterId]
  );
};

exports.rejectRequest = async (requestId, shelterId) => {
  await db.query(`DELETE FROM adoptionrequests WHERE request_id = ? AND shelter_id = ?`, [
    requestId,
    shelterId,
  ]);
};