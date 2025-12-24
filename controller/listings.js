const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const { cloudinary } = require("../cloudConfig");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewFrom = (req, res) => {
  res.render("listings/newList.ejs");
};

module.exports.showListing = async (req, res) => {
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
  res.render("listings/moreInfo.ejs", { listing, currUser: req.user });
};

module.exports.addNewListing = async (req, res) => {

  
  if (!req.file) {
    throw new ExpressError(400, "Image upload required!");
  }
  
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { 
    url: req.file.secure_url, 
    filename: req.file.filename 
  };
  await newListing.save();
  req.flash("success", "New listing created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
   req.flash("error", "Listing Not Found!");
   return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
   originalImageUrl = originalImageUrl.replace("/upload/", "/upload/w_250,h_200,c_fill/");
  res.render("listings/update.ejs", { listing , originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
    let listing =  await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if ( typeof req.file !== "undefined") {
   let url = req.file.secure_url;
  let filename = req.file.filename;
  listing.image = { url, filename };
  await listing.save();
    }


  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
