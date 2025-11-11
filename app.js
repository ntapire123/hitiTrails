const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 3000;
const path = require("path");
const methodOverride = require('method-override');
const ejsmate = require("ejs-mate");
const Review = require("./models/review.js");
const { listingSchema} = require("./Schema.js");
const ExpressError = require("./utils/ExpressError.js");
const listings = require("./routes/listing.js")
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine("ejs", ejsmate);
app.use(express.static(path.join(__dirname, "/public")));
const listingsRouter = require("./routes/listing.js"); 
const reviewsRouter = require("./routes/review.js");

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderLust');2
}

main().then(() => {
    console.log("Connection to DB successful");
}).catch((err) => {
    console.log("DB connection error:", err);
});

app.listen(port, () => {
    console.log("Server is listening on port", port);
});

// Middleware to validate Listing Schema
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};


app.get("/", (req, res) => {
    res.redirect("/listings");
});

// listing app.use
app.use("/listings",listingsRouter);


app.use("/listings/:id/reviews",reviewsRouter)
// Create Review Route


// 404 Not Found Middleware
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// General Error Handling Middleware
app.use((err, req, res, next) => {
    let { status = 500, message = "Something went wrong" } = err;
    res.status(status).render("errors/err1.ejs", { message });
});