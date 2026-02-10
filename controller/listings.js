const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const { cloudinary } = require("../cloudConfig");
const maptilerClient = require('@maptiler/client');
maptilerClient.config.apiKey = process.env.MAP_TOKEN;


module.exports.index = async (req, res, next) => {
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

  
  
};

module.exports.renderNewFrom = (req, res) => {
  res.render("listings/newList.ejs");
};

module.exports.showListing = async (req, res, next) => {
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
          // Update the listing with geocoded coordinates
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
};

module.exports.addNewListing = async (req, res, next) => {
  try {
    console.log('📝 Full req.body:', JSON.stringify(req.body, null, 2));
    console.log('📝 req.body.listing:', JSON.stringify(req.body.listing, null, 2));
    console.log('📝 req.file:', req.file ? { filename: req.file.filename, secure_url: req.file.secure_url } : 'No file');

    if (!req.file) {
      console.log('addNewListing: missing req.file');
      throw new ExpressError(400, "Image upload required!");
    }

    console.log('addNewListing: creating Listing object');
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { 
      url: req.file.secure_url, 
      filename: req.file.filename 
    };

    console.log('📋 Listing object before save:', newListing);

    // Geocode the location
    if (newListing.location) {
      try {
        const geoResults = await maptilerClient.geocoding.forward(newListing.location);
        if (geoResults.features && geoResults.features.length > 0) {
          const coordinates = geoResults.features[0].geometry.coordinates;
          newListing.geometry = {
            type: 'Point',
            coordinates: coordinates
          };
          console.log('addNewListing: geocoded to', coordinates);
        }
      } catch (geoErr) {
        console.log('addNewListing: geocoding error', geoErr.message);
      }
    }

    // Test validation before saving
    try {
      await newListing.validate();
      console.log('✅ Listing validation passed');
    } catch (validationError) {
      console.log('❌ Listing validation failed:', validationError.message);
      return next(validationError);
    }
    
    await newListing.save();
    console.log('✅ Listing saved successfully');
    
    req.flash("success", "New listing created!");
    res.redirect("/listings");
  } catch (err) {
    console.log('❌ Error creating listing:', err.message);
    next(err);
  }
};

module.exports.renderEditForm = async (req, res, next) => {
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
};

module.exports.updateListing = async (req, res, next) => {
  try {
    let { id } = req.params;
    console.log('updateListing: start', id);
    let listing = await Listing.findById(id);
    console.log('updateListing: fetched listing');

    if (!listing) {
      throw new ExpressError(404, "Listing Not Found!");
    }

    // Update listing data
    Object.assign(listing, req.body.listing);

    // Geocode the location if it was updated
    if (req.body.listing.location) {
      try {
        const geoResults = await maptilerClient.geocoding.forward(req.body.listing.location);
        if (geoResults.features && geoResults.features.length > 0) {
          const coordinates = geoResults.features[0].geometry.coordinates;
          listing.geometry = {
            type: 'Point',
            coordinates: coordinates
          };
          console.log('updateListing: geocoded to', coordinates);
        }
      } catch (geoErr) {
        console.log('updateListing: geocoding error', geoErr.message);
      }
    }

    // Update image if provided
    if (typeof req.file !== "undefined") {
      let url = req.file.secure_url;
      let filename = req.file.filename;
      listing.image = { url, filename };
    }

    console.log('updateListing: before save');
    await listing.save();
    console.log('updateListing: after save');
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.error('updateListing: error', err && err.message);
    next(err);
  }
};
