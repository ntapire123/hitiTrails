const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 3000;
const listing = require("./models/listing.js");
const path = require("path");
var methodOverride = require('method-override')
const ejsmate = require("ejs-mate");



app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))
app.engine("ejs",ejsmate);
app.use(express.static(path.join(__dirname,"/public")));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderLust');
}

app.listen(port, () => {
    console.log("Server is listening on port", port);
})


main().then((result) => {
    console.log("Connection success");
}).catch((err) => {
    console.log("some error happened")
})

app.get("/", (req, res) => {
    res.send("Hi I am root")
})


//ShowAll route

app.get("/listings", async (req, res) => {
    const allListings = await listing.find({});
    res.render("listings/index.ejs", { allListings });
})

//Show an individual route
app.get("/listings/:_id", async (req, res) => {
    let { _id } = req.params;
    const soloListing = await listing.findById(_id);
    res.render("listings/moreInfo.ejs", { listing:soloListing });
})

//create route

app.get("/new",(req,res)=>{
    res.render("listings/newList.ejs")
})


//submit the data
app.post("/listings/new/:id", (req, res) => {
    let newlisting = req.body;
    let new_listing = new listing(newlisting);
    new_listing.save().then((result) => {
        console.log("saving success");
    })

    res.redirect("/listings");


})

//update page request route

app.get("/listings/:id/edit", async (req, res) => {
    let { id } = req.params;
    let Listing = await listing.findById(id);

    res.render("listings/update.ejs", { Listing });

});

//update route
app.put("/listings/:_id/edit", async (req, res) => {
    let { _id } = req.params;
    let newlisting = await listing.findByIdAndUpdate(_id, req.body);
    res.redirect(`/listings/${_id}`);


})

//Delete route

app.delete("/listings/:_id/delete",async(req,res)=>{
    let { _id } = req.params;
    deletedvalue = await listing.findByIdAndDelete(_id);
    res.redirect("/listings");


}) 