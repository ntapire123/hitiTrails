const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,

  image: [
    {
      filename: String,
      url: {
        type: String,
        default: "https://picsum.photos/200",
        set: (v) => (v === "" ? "https://picsum.photos/200" : v),
      },
      _id: false,
    },
  ],

  price: Number,
  location: String,
  country: String,
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
