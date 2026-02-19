// routes/pages/index.js
const express = require("express");
const router = express.Router();

const sheltersModel = require("../models/sheltersModel");

router.get("/", (req, res) => {
  res.render("index", { pageTitle: "PawFinder - Adoption Site" });
});

router.get("/how-it-works", async (req, res) => {
  let shelters = [];
  try {
    shelters = await sheltersModel.getAllShelters();
  } catch (err) {
    console.error("Failed to load shelters:", err);
  }

  res.render("pages/howItWorks", {
    pageTitle: "How It Works | PawFinder",
    shelters,
  });
});

router.get("/quiz", (req, res) => {
  res.render("pages/quiz", {
    pageTitle: "Dog Quiz",
    phpSaveUrl: "https://zloofma.mtacloud.co.il/Final_Project/quiz_results.php"
  });
});


module.exports = router;
