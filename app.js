// app.js
const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();

// Body parsing
app.use(express.urlencoded({ extended: true }));

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret_change_me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // secure: true, 
      maxAge: 1000 * 60 * 60 * 4, 
    },
  })
);

// View Engine - EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static from /public - CSS, client JS, Images, Videos.
app.use(express.static(path.join(__dirname, "public")));

// Routes
const pagesRoutes = require("./routes/pagesRoutes");
const dogsRoutes = require("./routes/dogsRoutes");
const adoptionRequestsRoutes = require("./routes/adoptionRequestsRoutes");
const dogSubmissionRoutes = require("./routes/dogSubmissionsRoutes");
const sheltersRoutes = require("./routes/sheltersRoutes");

app.use("/dog-submission", dogSubmissionRoutes);
app.use("/dogs", dogsRoutes);
app.use("/adoption-request", adoptionRequestsRoutes);

// Shelter routes
app.use("/shelter", sheltersRoutes);

// Pages last
app.use("/", pagesRoutes);

// 404
app.use((req, res) => {
  res.status(404).render("pages/error", {
    pageTitle: "Page Not Found",
  });
});

// Server
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});


module.exports = app;
