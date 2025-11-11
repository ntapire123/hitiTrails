const express = require("express");
const app = express();
const users = require("./routes/user.js");
const post = require("./routes/post.js");


app.get("/",(req,res)=>{
    res.send("Hi I am root");
});

app.get("/getcookies",(req,res)=>{
    res.cookie("Greet","hello");
    res.send("Hi cookie ")
})


app.listen(8080,()=>{
    console.log(("server is listening to 8080"));
})
