const User = require("../models/user");

module.exports.showSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};
module.exports.signup = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    // User.register is a new method from passport-local-mongoose
    const registeredUser = await User.register(newUser, password);
    // Log the user in right after they register
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to HitiTrails!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.loginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res, next) => {
  req.flash("success", "Welcome back! You are logged in.");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  // Clear redirectUrl from session after using it
  if (req.session.redirectUrl) {
    delete req.session.redirectUrl;
  }
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You have been logged out.");
    res.redirect("/listings");
  });
};
