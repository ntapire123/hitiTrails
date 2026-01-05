// 1. ENV + REQUIRES
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/user.js");
const ExpressError = require("./utils/ExpressError.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// 2. DB URL + APP
const DBURL = process.env.ATLASDB_URL;
const app = express();
const port = process.env.PORT || 3000;

// 3. DB CONNECTION
async function main() {
  await mongoose.connect(DBURL);
}
main()
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB error:", err));

// 4. VIEW ENGINE
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 5. GLOBAL MIDDLEWARE
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// 6. SESSION STORE (connect-mongo v4)
const store = MongoStore.create({
  mongoUrl: DBURL,
  touchAfter: 24 * 3600, // seconds
  stringify: false,
});

store.on("error", (err) => {
  console.log("Error in MONGO SESSION STORE", err);
  // Don't crash the app on session store errors
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// 7. PASSPORT CONFIG
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// 8. FLASH + CURRENT USER LOCALS
app.use((req, res, next) => {
  const successFlash = req.flash("success");
  const errorFlash = req.flash("error");
  res.locals.success = Array.isArray(successFlash) ? successFlash : [];
  res.locals.error = Array.isArray(errorFlash) ? errorFlash : [];
  res.locals.currUser = req.user;
  next();
});

// 9. ROUTES
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

// 10. 404 HANDLER
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// 11. ERROR HANDLER
app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong" } = err;
  res.status(status).render("errors/err1.ejs", { message });
});

// 12. START SERVER
app.listen(port, () => {
  console.log("Server running on port " + port);
});
