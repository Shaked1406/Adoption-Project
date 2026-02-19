const pool = require("../util/database");

// Get all submissions for a specific shelter
async function getByShelterId(shelterId) {
  const [rows] = await pool.query(
    `SELECT *
     FROM dogsubmissions
     WHERE preferred_shelter_id = ?
     ORDER BY created_at DESC`,
    [shelterId]
  );
  return rows;
}

// Reject: update status
async function rejectSubmission(submissionId) {
  await pool.query(
    "UPDATE dogsubmissions SET status = 'rejected' WHERE submission_id = ?",
    [submissionId]
  );
}

// Approve: transaction (insert into dogs + update submission status)
// Allows multiple dogs with the same name.
// Prevents double-approve by checking status first.
async function approveSubmission(submissionId) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      "SELECT * FROM dogsubmissions WHERE submission_id = ?",
      [submissionId]
    );

    const submission = rows[0];
    if (!submission) {
      throw new Error("Dog submission not found");
    }

    // Prevent approving the same submission twice
    if (submission.status === "approved") {
      await conn.rollback();
      return;
    }

    // Use submission image_url if exists, otherwise fallback
    const imageUrl =
      submission.image_url && String(submission.image_url).trim()
        ? submission.image_url
        : "/Images/dogs/missing.png";

    // Always INSERT a new dog record (even if name already exists)
    await conn.query(
      `INSERT INTO dogs
        (dog_name, age_years, breed, size, gender, short_description, is_available, shelter_id, image_url)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [
        submission.dog_name,
        submission.dog_age_years,
        submission.dog_breed,
        submission.dog_size,
        submission.dog_gender,
        submission.dog_description,
        submission.preferred_shelter_id,
        imageUrl,
      ]
    );

    // Mark submission as approved
    await conn.query(
      "UPDATE dogsubmissions SET status = 'approved' WHERE submission_id = ?",
      [submissionId]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = {
  getByShelterId,
  approveSubmission,
  rejectSubmission,
};
