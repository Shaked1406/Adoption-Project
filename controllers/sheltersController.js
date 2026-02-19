// controllers/shelters/sheltersController.js
const bcrypt = require("bcrypt");

const db = require("../util/database");
const shelterAuthModel = require("../models/shelterAuthModel");
const shelterAdoptionRequestsModel = require("../models/shelterAdoptionRequestsModel");
const shelterDogSubmissionsModel = require("../models/shelterDogSubmissionsModel");

function isEmailValid(email) {
  return typeof email === "string" && email.includes("@");
}

function isNonEmpty(str, max = 255) {
  return typeof str === "string" && str.trim().length > 0 && str.trim().length <= max;
}

// ----------------------------
// Register
// ----------------------------
exports.getRegister = async (req, res) => {
  try {
    const [shelters] = await db.query(
      "SELECT shelter_id, name FROM shelters ORDER BY name"
    );

    res.render("shelter/register", {
      pageTitle: "Shelter Register",
      msg: req.query.msg || null,
      shelters,
    });
  } catch (err) {
    console.error("getRegister error:", err);
    res.redirect("/?msg=Failed%20to%20load%20register%20page.");
  }
};

exports.postRegister = async (req, res) => {
  try {
    const { email, password, shelter_id } = req.body;

    if (!isEmailValid(email) || !isNonEmpty(password, 200)) {
      return res.redirect("/shelter/register?msg=Invalid%20email%20or%20password.");
    }

    const shelterIdNum = Number(shelter_id);
    if (!shelterIdNum) {
      return res.redirect("/shelter/register?msg=Please%20select%20a%20shelter.");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await shelterAuthModel.findUserByEmail(normalizedEmail);
    if (existing) {
      return res.redirect("/shelter/register?msg=This%20email%20is%20already%20registered.");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await shelterAuthModel.createUser(normalizedEmail, passwordHash);

    const affected = await shelterAuthModel.linkShelterToUser(shelterIdNum, userId);
    if (affected !== 1) {
      return res.redirect(
        "/shelter/register?msg=Failed%20to%20link%20shelter.%20Check%20if%20it%20is%20already%20assigned."
      );
    }

    return res.redirect("/shelter/login?msg=Registration%20successful.%20Please%20log%20in.");
  } catch (err) {
    console.error("postRegister error:", err);
    return res.redirect(
      "/shelter/register?msg=Something%20went%20wrong.%20Maybe%20this%20shelter%20is%20already%20assigned."
    );
  }
};

// ----------------------------
// Login / Logout
// ----------------------------
exports.getLogin = (req, res) => {
  res.render("shelter/login", {
    pageTitle: "Shelter Login",
    formError: null,
    successMsg: null,
    email: "",
  });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).render("shelter/login", {
      pageTitle: "Shelter Login",
      formError: "Please enter both email and password.",
      successMsg: null,
      email: email || "",
    });
  }

  try {
    const row = await shelterAuthModel.findShelterUserByEmail(email);

    if (!row) {
      return res.status(401).render("shelter/login", {
        pageTitle: "Shelter Login",
        formError: "Invalid credentials.",
        successMsg: null,
        email,
      });
    }

    const isMatch = await bcrypt.compare(password, row.password_hash);
    if (!isMatch) {
      return res.status(401).render("shelter/login", {
        pageTitle: "Shelter Login",
        formError: "Invalid credentials.",
        successMsg: null,
        email,
      });
    }

    req.session.shelterUser = {
      userId: row.user_id,
      shelterId: row.shelter_id,
      shelterName: row.shelter_name,
      email: row.email,
    };

    return res.redirect("/shelter/dashboard");
  } catch (err) {
    console.error("Shelter login error:", err);
    return res.status(500).render("shelter/login", {
      pageTitle: "Shelter Login",
      formError: "Something went wrong. Please try again.",
      successMsg: null,
      email,
    });
  }
};

exports.postLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/shelter/login");
  });
};

// ----------------------------
// Dashboard
// ----------------------------
exports.getDashboard = (req, res) => {
  res.render("shelter/dashboard", {
    pageTitle: "Shelter Dashboard",
    shelterName: req.session.shelterUser.shelterName,
  });
};

// ----------------------------
// Adoption requests management
// ----------------------------
exports.listAdoptionRequests = async (req, res) => {
  try {
    const shelterId = req.session.shelterUser.shelterId;
    const shelterName = req.session.shelterUser.shelterName;

    const requests = await shelterAdoptionRequestsModel.getRequestsByShelterId(shelterId);

    return res.render("shelter/adoptionRequests", {
      pageTitle: "Adoption Requests",
      shelterName,
      requests,
      flash: req.query.flash || null,
    });
  } catch (err) {
    console.error("LIST ADOPTION REQUESTS ERROR:", err);
    return res.status(500).render("pages/error", { pageTitle: "Server Error" });
  }
};

exports.approveAdoptionRequest = async (req, res) => {
  try {
    const shelterId = req.session.shelterUser.shelterId;
    const requestId = Number(req.params.requestId);

    if (!Number.isFinite(requestId)) {
      return res.status(400).render("pages/error", { pageTitle: "Invalid request id" });
    }

    const row = await shelterAdoptionRequestsModel.getRequestByIdAndShelterId(requestId, shelterId);
    if (!row) {
      return res.status(404).render("pages/error", { pageTitle: "Request not found" });
    }

    await shelterAdoptionRequestsModel.approveRequest(requestId, row.dog_id, shelterId);

    return res.redirect(
      "/shelter/adoption-requests?flash=" +
        encodeURIComponent(
          "Approved! An email invitation has been sent to the applicant to visit the shelter."
        )
    );
  } catch (err) {
    console.error("APPROVE REQUEST ERROR:", err);
    return res.status(500).render("pages/error", { pageTitle: "Server Error" });
  }
};

exports.rejectAdoptionRequest = async (req, res) => {
  try {
    const shelterId = req.session.shelterUser.shelterId;
    const requestId = Number(req.params.requestId);

    if (!Number.isFinite(requestId)) {
      return res.status(400).render("pages/error", { pageTitle: "Invalid request id" });
    }

    const row = await shelterAdoptionRequestsModel.getRequestByIdAndShelterId(requestId, shelterId);
    if (!row) {
      return res.status(404).render("pages/error", { pageTitle: "Request not found" });
    }

    await shelterAdoptionRequestsModel.rejectRequest(requestId, shelterId);

    return res.redirect(
      "/shelter/adoption-requests?flash=" +
        encodeURIComponent("Rejected. An update email has been sent to the applicant.")
    );
  } catch (err) {
    console.error("REJECT REQUEST ERROR:", err);
    return res.status(500).render("pages/error", { pageTitle: "Server Error" });
  }
};
// ----------------------------
// Dog submissions management
// ----------------------------
exports.getDogSubmissions = async (req, res) => {
  try {
    const shelterId = req.session.shelterUser.shelterId;
    const submissions = await shelterDogSubmissionsModel.getByShelterId(shelterId);

    return res.render("shelter/dogSubmissions", {
      pageTitle: "Dog Submission Requests",
      shelterName: req.session.shelterUser.shelterName,
      submissions,
      flash: req.query.flash || null, // ADDED
    });
  } catch (err) {
    console.error("get dog submissions error:", err);
    return res.status(500).render("pages/error", { pageTitle: "Server Error" });
  }
};

exports.approveDogSubmission = async (req, res) => {
  try {
    await shelterDogSubmissionsModel.approveSubmission(req.params.id);
    return res.redirect(
      "/shelter/dog-submissions?flash=" + encodeURIComponent("Approved submission.")
    ); // CHANGED
  } catch (err) {
    console.error("approve submission error:", err);
    return res.status(500).render("pages/error", { pageTitle: "Server Error" });
  }
};

exports.rejectDogSubmission = async (req, res) => {
  try {
    await shelterDogSubmissionsModel.rejectSubmission(req.params.id);
    return res.redirect(
      "/shelter/dog-submissions?flash=" + encodeURIComponent("Rejected submission.")
    ); // CHANGED
  } catch (err) {
    console.error("reject submission error:", err);
    return res.status(500).render("pages/error", { pageTitle: "Server Error" });
  }
};