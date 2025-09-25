const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 3000;
const listing = require("./models/listing.js");
const path = require("path");



app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));


async function main() {
   await mongoose.connect('mongodb://127.0.0.1:27017/wanderLust');
}

app.listen(port,()=>{
    console.log("Server is listening on port",port);
})


main().then((result)=>{
    console.log("Connection success");
}).catch((err)=>{
    console.log("some error happened")
})

app.get("/",(req,res)=>{
    res.send("Hi I am root")
})




app.get("/listings",async (req,res)=>{
const allListings = await listing.find({});
res.render("listings/index.ejs",{allListings});
})


app.get("/listings/:id",async (req,res)=>{
    let { id } = req.params;
    const listingbyid =  await listing.findById(id)
    res.render("listings/moreInfo.ejs",{ listingbyid });
})