// routes/adoptionRequests/index.js
const express = require("express");
const router = express.Router();

const controller = require("../controllers/adoptionRequestsController");

// Mounted at /adoption-request
router.get("/", controller.getForm);
router.post("/", controller.submitForm);

module.exports = router;
