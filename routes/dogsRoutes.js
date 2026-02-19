// routes/dogs/index.js
const express = require("express");
const router = express.Router();

const dogsController = require("../controllers/dogsController");

// Mounted at /dogs
router.get("/available-dogs", dogsController.getAvailableDogs);

module.exports = router;
