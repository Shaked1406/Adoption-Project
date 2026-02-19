exports.requireShelterAuth = (req, res, next) => {
  if (!req.session || !req.session.shelterUser) {
    return res.redirect("/shelter/login");
  }
  next();
};
