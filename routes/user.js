const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport"); // Now you can require it here
const { saveRedirectUrl } = require("../middleware.js");

// GET route to show the signup form
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

// POST route to handle user registration
router.post("/signup", wrapAsync(async (req, res) => {
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
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

// GET route to show the login form
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

// POST route to handle login (your code, which will now work)
router.post(
    "/login",
    saveRedirectUrl,
    passport.authenticate("local", { 
        failureRedirect: '/login', 
        failureFlash: true 
    }),
    async (req, res) => { 
        req.flash("success", "Welcome back! You are logged in.");
        let redirectUrl = res.locals.redirectUrl || "/listings" ;
        res.redirect(redirectUrl);
    }
);

// GET route for logout
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash("success", "You have been logged out.");
        res.redirect("/listings");
    });
});


router.get("/logout", (req,res,next)=>{
    req.logout((err)=>{

        if (err){

           return next(err);
        }

        req.flash("success","You are logged out now");
        res.redirect("/redirect")
    })
})
module.exports = router;