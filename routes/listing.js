const express = require("express");
const router = express.Router();
const ExpressError = require("../utils/ExpressError");
const wrapAsync = require("../utils/wrapAsync");
const { listingSchema, reviewSchema } = require("../Schema.js");
const Listing = require("../models/listing.js");


const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// Index Route (Show all listings)
router.get( "/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({})
    res.render("listings/index.ejs", { allListings });
}));

// New Route (Show form to create new listing)
router.get("/new", (req, res) => {
    res.render("listings/newList.ejs");
});

// Show Route (Show one individual listing)
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
        throw new ExpressError(404, "Listing Not Found!");
    }
    res.render("listings/moreInfo.ejs", { listing });
}));

// Create Route (Submit the new listing)
router.post( "/", validateListing, wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect( "/");
}));

// Edit Route (Show form to edit a listing)
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
     if (!listing) {
        throw new ExpressError(404, "Listing Not Found!");
    }
    res.render("listings/update.ejs", { listing });
}));

// Update Route (Submit the edited listing)
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(` /${id}`);
}));

// Delete Route (Delete a listing)
router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id) 
    res.redirect( "/");
}));


module.exports = router;