// routes/dogSubmissionsRoutes.js
const express = require("express");
const router = express.Router();

const path = require("path");
const fs = require("fs");
const multer = require("multer");

const controller = require("../controllers/dogSubmissionsController");

// Always save uploads under: <project_root>/public/Images/dogs
const uploadDir = path.join(process.cwd(), "public", "Images", "dogs");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase(); // .jpg/.jpeg/.png
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  // Accept only PNG or JPG/JPEG
  if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb(new Error("Only PNG or JPG/JPEG images are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// GET form
router.get("/", controller.getForm);

// POST form with optional image
router.post(
  "/",
  (req, res, next) => {
    upload.single("dog_image")(req, res, (err) => {
      if (err) req.uploadError = err.message || "Image upload failed.";
      next();
    });
  },
  controller.submitForm
);

module.exports = router;
