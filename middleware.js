const Listing = require("./models/listing");
const Review = require("./models/review");
const { listingSchema } = require("./Schema.js");
const ExpressError = require("./utils/ExpressError.js");
const { reviewSchema } = require("./Schema.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be loggedin to access this feature");
    res.redirect("/login");
    next();
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};


module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!res.locals.currUser) {
    req.flash("error", "You must be logged in to access this feature!");
    res.redirect("/login");
    next();
  }
  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You do not have permission to do that!");
    res.redirect(`/listings/${id}`);
    next();
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!res.locals.currUser) {
    req.flash("error", "You must be logged in to access this feature!");
    res.redirect("/login");
    next();
  }
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You do not have permission to do that!");
    res.redirect(`/listings/${id}`);
    next();
  }
  next();
};
