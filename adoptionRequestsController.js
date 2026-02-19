const adoptionRequestsModel = require("../models/adoptionRequestsModel");

// GET /adoption-request?dog_id=#
exports.getForm = async (req, res) => {
  try {
    const dogId = Number(req.query.dog_id) || "";

    return res.render("adoptionRequests/adoptionRequest", {
      pageTitle: "Adoption Request",
      formError: null,
      successMsg: null,
      values: {
        dog_id: dogId,
        full_name: "",
        phone: "",
        email: "",
        city: "",
        additional_notes: ""
      },
      errors: {}
    });

  } catch (err) {
    console.error("getForm error:", err);
    return res.status(500).render("adoptionRequests/adoptionRequest", {
      pageTitle: "Adoption Request",
      formError: "Server error.",
      successMsg: null,
      values: {
        dog_id: "",
        full_name: "",
        phone: "",
        email: "",
        city: "",
        additional_notes: ""
      },
      errors: {}
    });
  }
};

// POST /adoption-request
exports.submitForm = async (req, res) => {
  try {
    const dog_id = Number(req.body.dog_id);
    const full_name = (req.body.full_name || "").trim();
    const phone = (req.body.phone || "").trim();
    const email = (req.body.email || "").trim();
    const city = (req.body.city || "").trim();
    const additional_notes = (req.body.additional_notes || "").trim();

    // validation
    if (!dog_id || !full_name || !phone || !email) {
      return res.status(400).render("adoptionRequests/adoptionRequest", {
        pageTitle: "Adoption Request",
        formError: "Please fill all required fields.",
        successMsg: null,
        values: {
          dog_id,
          full_name,
          phone,
          email,
          city,
          additional_notes
        },
        errors: {}
      });
    }

    await adoptionRequestsModel.createAdoptionRequest({
      dog_id,
      full_name,
      phone,
      email,
      city: city || null,
      additional_notes: additional_notes || null
    });

    return res.render("adoptionRequests/adoptionRequest", {
      pageTitle: "Adoption Request",
      formError: null,
      successMsg: "Request submitted successfully!",
      values: {
        dog_id,
        full_name: "",
        phone: "",
        email: "",
        city: "",
        additional_notes: ""
      },
      errors: {}
    });

  } catch (err) {
    console.error("submitForm error:", err);
    return res.status(500).render("adoptionRequests/adoptionRequest", {
      pageTitle: "Adoption Request",
      formError: "The request was not submitted due to a server error. Please try again.",
      successMsg: null,
      values: {
        dog_id: req.body.dog_id || "",
        full_name: req.body.full_name || "",
        phone: req.body.phone || "",
        email: req.body.email || "",
        city: req.body.city || "",
        additional_notes: req.body.additional_notes || ""
      },
      errors: {}
    });
  }
};
