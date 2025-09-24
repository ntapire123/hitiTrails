const express = require("express");
const app = express();
const moongose = require("mongoose");
const port = 3000;

async function main() {
   await moongose.connect('mongodb://127.0.0.1:27017/wanderLust');
}

app.listen(port,()=>{
    console.log("Server is listening on port",port);
})

app.get("/",(req,res)=>{
    res.send("Hi I am root")
})

Main().then((result)=>{
    console.log("Connection success");
}).catch((err)=>{
 console.log("some error happened")
})
