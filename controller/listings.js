const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const wrapAsync = require("../utils/wrapAsync");
const { cloudinary } = require("../cloudConfig");
const maptilerClient = require('@maptiler/client');
maptilerClient.config.apiKey = process.env.MAP_TOKEN;

module.exports.index = wrapAsync(async (req, res, next) => {
  try {
const { category, q } = req.query; // /listings?category=mountains  [web:77]
  let filter = {};

  // Trending = home page = show all listings
  if (category && category.toLowerCase() !== "trending") {
    filter.category = category.toLowerCase(); // matches your enum values [web:91]
  }

  // text search filter on title, country, location (case-insensitive)
    if (q && q.trim() !== "") {
      const regex = new RegExp(q.trim(), "i");
      filter.$or = [
        { title: regex },
        { country: regex },
        { location: regex },
      ];
    }

  const allListings = await Listing.find(filter);
  res.render("listings/index.ejs", { allListings, category: category || "trending" });
  } catch (err) {
    next(err);
  }
});

module.exports.renderNewFrom = (req, res) => {
  res.render("listings/newList.ejs");
};

module.exports.showListing = wrapAsync(async (req, res, next) => {
  try {
    let { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: { path: "author" },
      })
      .populate("owner");
    if (!listing) {
      throw new ExpressError(404, "Listing Not Found!");
    }

    // Geocode location if we don't have coordinates
    let coordinates = listing.geometry?.coordinates || [0, 0];
    if ((coordinates[0] === 0 && coordinates[1] === 0) && listing.location) {
      try {
        const geoResults = await maptilerClient.geocoding.forward(listing.location);
        if (geoResults.features && geoResults.features.length > 0) {
          coordinates = geoResults.features[0].geometry.coordinates;
          // Update listing with geocoded coordinates
          listing.geometry = {
            type: 'Point',
            coordinates: coordinates
          };
          await listing.save();
        }
      } catch (geoErr) {
        console.log("Geocoding error:", geoErr);
      }
    }

    res.render("listings/moreInfo.ejs", { listing, currUser: req.user, coordinates });
  } catch (err) {
    next(err);
  }
});

module.exports.addNewListing = wrapAsync(async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ExpressError(400, "Image upload required!");
    }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { 
      url: req.file.secure_url, 
      filename: req.file.filename 
    };

    // Geocode location
    if (newListing.location) {
      try {
        const geoResults = await maptilerClient.geocoding.forward(newListing.location);
        if (geoResults.features && geoResults.features.length > 0) {
          const coordinates = geoResults.features[0].geometry.coordinates;
          newListing.geometry = {
            type: 'Point',
            coordinates: coordinates
          };
        }
      } catch (geoErr) {
        console.log("Geocoding error:", geoErr);
      }
    }

    await newListing.save();
    req.flash("success", "New listing created!");
    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
});

module.exports.renderEditForm = wrapAsync(async (req, res, next) => {
  try {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      throw new ExpressError(404, "Listing Not Found!");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload/", "/upload/w_250,h_200,c_fill/");
    res.render("listings/update.ejs", { listing, originalImageUrl });
  } catch (err) {
    next(err);
  }
});

module.exports.updateListing = wrapAsync(async (req, res, next) => {
  try {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing) {
      throw new ExpressError(404, "Listing Not Found!");
    }

    // Update listing data
    Object.assign(listing, req.body.listing);

    // Geocode location if it was updated
    if (req.body.listing.location) {
      try {
        const geoResults = await maptilerClient.geocoding.forward(req.body.listing.location);
        if (geoResults.features && geoResults.features.length > 0) {
          const coordinates = geoResults.features[0].geometry.coordinates;
          listing.geometry = {
            type: 'Point',
            coordinates: coordinates
          };
        }
      } catch (geoErr) {
        console.log("Geocoding error:", geoErr);
      }
    }

    // Update image if provided
    if (typeof req.file !== "undefined") {
      let url = req.file.secure_url;
      let filename = req.file.filename;
      listing.image = { url, filename };
    }

    await listing.save();
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    next(err);
  }
});

module.exports.deleteListing = wrapAsync(async (req, res, next) => {
  try {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
});
