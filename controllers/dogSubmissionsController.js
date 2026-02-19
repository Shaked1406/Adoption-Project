const dogSubmissionModel = require("../models/dogSubmissionModel");

function validate(body) {
  const errors = {};

  const submitter_full_name = (body.submitter_full_name || "").trim();
  const submitter_phone = (body.submitter_phone || "").trim();
  const submitter_email = (body.submitter_email || "").trim();

  const dog_name = (body.dog_name || "").trim();
  const dog_age_years = (body.dog_age_years || "").toString().trim();
  const dog_breed = (body.dog_breed || "").trim();
  const dog_size = (body.dog_size || "").trim();
  const dog_gender = (body.dog_gender || "").trim();
  const dog_description = (body.dog_description || "").trim();

  const preferred_shelter_id = (body.preferred_shelter_id || "").toString().trim();

  // Required fields
  if (!submitter_full_name) errors.submitter_full_name = "Full name is required.";
  if (!submitter_phone) errors.submitter_phone = "Phone number is required.";
  if (!submitter_email) errors.submitter_email = "Email is required.";

  if (!dog_name) errors.dog_name = "Dog name is required.";
  if (!dog_age_years) errors.dog_age_years = "Dog age is required.";
  if (!dog_breed) errors.dog_breed = "Breed / type is required.";
  if (!dog_size) errors.dog_size = "Dog size is required.";
  if (!dog_gender) errors.dog_gender = "Dog gender is required.";
  if (!dog_description) errors.dog_description = "Description is required.";
  if (!preferred_shelter_id) errors.preferred_shelter_id = "Preferred shelter is required.";

  // Name must not contain numbers
  if (submitter_full_name && /\d/.test(submitter_full_name)) {
    errors.submitter_full_name = "Name cannot contain numbers.";
  }

  // Phone: numeric with reasonable length (allows dashes/spaces, validates after normalization)
  if (submitter_phone) {
    const normalized = submitter_phone.replace(/[^\d]/g, "");
    if (!/^\d+$/.test(normalized)) {
      errors.submitter_phone = "Phone number must be numeric.";
    } else if (normalized.length < 9 || normalized.length > 11) {
      errors.submitter_phone = "Phone number length is invalid.";
    }
  }

  // Valid email format
  if (submitter_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submitter_email)) {
    errors.submitter_email = "Invalid email format.";
  }

  // Dog age must be a number (allow decimals like 2.5)
  if (dog_age_years) {
    const n = Number(dog_age_years);
    if (Number.isNaN(n)) {
      errors.dog_age_years = "Dog age must be a number.";
    } else if (n < 0 || n > 30) {
      errors.dog_age_years = "Dog age must be between 0 and 30.";
    }
  }

  // Text fields should not be numbers-only
  const notNumbersOnly = (val) => val && !/^\d+$/.test(val);

  if (dog_name && !notNumbersOnly(dog_name)) errors.dog_name = "Dog name cannot be numbers only.";
  if (dog_breed && !notNumbersOnly(dog_breed)) errors.dog_breed = "Breed cannot be numbers only.";
  if (dog_description && !notNumbersOnly(dog_description)) {
    errors.dog_description = "Description cannot be numbers only.";
  }

  // Shelter id must be numeric
  if (preferred_shelter_id && !/^\d+$/.test(preferred_shelter_id)) {
    errors.preferred_shelter_id = "Invalid shelter selection.";
  }

  return {
    errors,
    values: {
      submitter_full_name,
      submitter_phone,
      submitter_email,
      dog_name,
      dog_age_years,
      dog_breed,
      dog_size,
      dog_gender,
      dog_description,
      preferred_shelter_id,
    },
  };
}

function emptyValues() {
  return {
    submitter_full_name: "",
    submitter_phone: "",
    submitter_email: "",
    dog_name: "",
    dog_age_years: "",
    dog_breed: "",
    dog_size: "",
    dog_gender: "",
    dog_description: "",
    preferred_shelter_id: "",
  };
}

exports.getForm = async (req, res) => {
  try {
    const shelters = await dogSubmissionModel.getShelters();

    return res.render("dogSubmissions/dogSubmission", {
      pageTitle: "Dog Submission",
      shelters,
      values: emptyValues(),
      errors: {},
      formError: "",
      successMsg: "",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).render("dogSubmissions/dogSubmission", {
      pageTitle: "Dog Submission",
      shelters: [],
      values: emptyValues(),
      errors: {},
      formError: "Could not load shelters. Please try again.",
      successMsg: "",
    });
  }
};

exports.submitForm = async (req, res) => {
  const { errors, values } = validate(req.body);

  // always load shelters for dropdown
  let shelters = [];
  try {
    shelters = await dogSubmissionModel.getShelters();
  } catch (e) {
    console.error(e);
  }

  // If multer rejected the file type/size, show a nice error
  if (req.uploadError) {
    return res.status(400).render("dogSubmissions/dogSubmission", {
      pageTitle: "Dog Submission",
      shelters,
      values,
      errors,
      formError: req.uploadError,
      successMsg: "",
    });
  }

  // Image handling (optional)
  const image_url = req.file
    ? `/Images/dogs/${req.file.filename}`
    : "/Images/dogs/missing.png";

  if (Object.keys(errors).length > 0) {
    return res.status(400).render("dogSubmissions/dogSubmission", {
      pageTitle: "Dog Submission",
      shelters,
      values,
      errors,
      formError: "The submission was not sent.",
      successMsg: "",
    });
  }

  try {
    await dogSubmissionModel.createDogSubmission({
      ...values,
      image_url,
    });

    return res.render("dogSubmissions/dogSubmission", {
      pageTitle: "Dog Submission",
      shelters,
      values: emptyValues(),
      errors: {},
      formError: "",
      successMsg: "Your dog submission has been successfully submitted.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).render("dogSubmissions/dogSubmission", {
      pageTitle: "Dog Submission",
      shelters,
      values,
      errors: {},
      formError: "The submission was not sent due to a server error. Please try again.",
      successMsg: "",
    });
  }
};
