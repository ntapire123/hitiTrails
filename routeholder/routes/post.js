const express = require("express");
const router = express.Router();

router.get("/posts", (req, res) => {
    res.send("GET for all posts");
});


router.get("/posts/:id", (req, res) => {
    let { id } = req.params;
    res.send(`GET for post with id: ${id}`);
});


router.post("/posts", (req, res) => {
    res.send("POST for creating a new post");
});


router.delete("/posts/:id", (req, res) => {
    let { id } = req.params;
    res.send(`DELETE for post with id: ${id}`);
});


router.put("/posts/:id", (req, res) => {
    let { id } = req.params;
    res.send(`PUT for updating post with id: ${id}`);
});

module.exports = router;