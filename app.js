const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 3000;
const listing = require("./models/listing.js");




async function main() {
   await mongoose.connect('mongodb://127.0.0.1:27017/wanderLust');
}

app.listen(port,()=>{
    console.log("Server is listening on port",port);
})

app.get("/",(req,res)=>{
    res.send("Hi I am root")
})

main().then((result)=>{
    console.log("Connection success");
}).catch((err)=>{
 console.log("some error happened")
})


