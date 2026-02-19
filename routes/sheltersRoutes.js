// routes/shelters/index.js
const express = require("express");
const router = express.Router();

const { requireShelterAuth } = require("../util/authShelter");
const sheltersController = require("../controllers/sheltersController");

// Auth & registration
router.get("/register", sheltersController.getRegister);
router.post("/register", sheltersController.postRegister);

router.get("/login", sheltersController.getLogin);
router.post("/login", sheltersController.postLogin);

router.post("/logout", sheltersController.postLogout);

// Dashboard
router.get("/dashboard", requireShelterAuth, sheltersController.getDashboard);

// Shelter adoption requests management
router.get("/adoption-requests", requireShelterAuth, sheltersController.listAdoptionRequests);
router.post("/adoption-requests/:requestId/approve", requireShelterAuth, sheltersController.approveAdoptionRequest);
router.post("/adoption-requests/:requestId/reject", requireShelterAuth, sheltersController.rejectAdoptionRequest);

// Shelter dog submissions management
router.get("/dog-submissions", requireShelterAuth, sheltersController.getDogSubmissions);
router.post("/dog-submissions/:id/approve", requireShelterAuth, sheltersController.approveDogSubmission);
router.post("/dog-submissions/:id/reject", requireShelterAuth, sheltersController.rejectDogSubmission);

module.exports = router;
