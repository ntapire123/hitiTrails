const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware.js");
const { 
  showUserBookings, 
  updateBookingStatus 
} = require("../controller/booking.js");

// Show user profile with bookings and listings
router.get("/profile", isLoggedIn, showUserBookings);

// Update booking status (confirm/cancel)
router.put("/bookings/:bookingId", isLoggedIn, updateBookingStatus);

module.exports = router;
