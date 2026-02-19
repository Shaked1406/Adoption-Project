// controllers/dogsController.js
const dogsModel = require("../models/dogsModel");

exports.getAvailableDogs = async (req, res) => {
  try {
    const filters = {
      size: (req.query.size || "").trim(),
      gender: (req.query.gender || "").trim(),
      age: (req.query.age || "").trim(),
    };

    const dogs = await dogsModel.getAvailableDogs(filters);

    // Fallback image for dogs without image_url
    const fallbackImageUrl = "/Images/dogs/missing.png";

    const dogsWithImages = (dogs || []).map((dog) => {
      const hasImage =
        dog &&
        typeof dog.image_url === "string" &&
        dog.image_url.trim().length > 0;

      return {
        ...dog,
        image_url: hasImage ? dog.image_url.trim() : fallbackImageUrl,
      };
    });

    return res.render("dogs/availableDogs", {
      pageTitle: "Available Dogs",
      dogs: dogsWithImages,
      query: req.query || {},
    });
  } catch (err) {
    console.error("getAvailableDogs error:", err);

    return res.render("dogs/availableDogs", {
      pageTitle: "Available Dogs",
      dogs: [],
      query: req.query || {},
    });
  }
};
