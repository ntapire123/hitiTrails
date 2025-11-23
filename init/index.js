const mongoose = require("mongoose");
const initData = require("./data.js");

const Listing = require("../models/listing.js");

main().then((result)=>{
    console.log("Connection success");
}).catch((err)=>{
    console.log("some error happened")
})

async function main() {
   await mongoose.connect('mongodb://127.0.0.1:27017/wanderLust');
}

const initDb = async()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj  , owner: "6915e6b37169852cc4164c0b"}))
    await Listing.insertMany(initData.data);
    console.log("The data was initalized");
}

initDb();