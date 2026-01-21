const Listing = require("../models/listing");
const Booking = require("../models/booking");
const wrapAsync = require("../utils/wrapAsync");

module.exports.showBookingForm = wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate("owner");
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  res.render("listings/book", { listing });
});

module.exports.createBooking = wrapAsync(async (req, res) => {
  const { id } = req.params;
  const { checkIn, checkOut, guests, message } = req.body;
  
  const listing = await Listing.findById(id).populate("owner");
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  // Calculate total price
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  const totalPrice = nights * listing.price * guests;

  // Create booking
  const booking = new Booking({
    listing: listing._id,
    booker: req.user._id,
    owner: listing.owner._id,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guests: parseInt(guests),
    totalPrice,
    message: message || ""
  });

  await booking.save();
  
  req.flash("success", "Booking request sent successfully! The owner will contact you soon.");
  res.redirect(`/listings/${id}`);
});

module.exports.showUserBookings = wrapAsync(async (req, res) => {
  // Show bookings made by the current user
  const myBookings = await Booking.find({ booker: req.user._id })
    .populate("listing")
    .populate("owner")
    .sort({ createdAt: -1 });

  // Show booking requests for listings owned by current user
  const receivedBookings = await Booking.find({ owner: req.user._id })
    .populate("listing")
    .populate("booker")
    .sort({ createdAt: -1 });

  // Show user's listings
  const myListings = await Listing.find({ owner: req.user._id }).sort({ createdAt: -1 });

  res.render("users/profile", { 
    myBookings, 
    receivedBookings, 
    myListings 
  });
});

module.exports.updateBookingStatus = wrapAsync(async (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body;
  
  const booking = await Booking.findById(bookingId)
    .populate("listing")
    .populate("booker");
    
  if (!booking) {
    req.flash("error", "Booking not found");
    return res.redirect("/profile");
  }

  // Check if current user is the owner of the listing
  if (!booking.owner.equals(req.user._id)) {
    req.flash("error", "You don't have permission to update this booking");
    return res.redirect("/profile");
  }

  booking.status = status;
  await booking.save();

  const statusMessage = status === 'confirmed' ? 'confirmed' : 'cancelled';
  req.flash("success", `Booking ${statusMessage} successfully`);
  res.redirect("/profile");
});
