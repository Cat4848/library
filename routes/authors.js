const express = require("express");
const router = express.Router();
const Author = require("../models/author")

//all authors route - authors search
router.get("/", async (req, res) => {
    let searchOptions = {};
    if (req.query.name != null && req.query.name !== "") {
        searchOptions.name = new RegExp(req.query.name, "i");
    }
    try {
        const allAuthors = await Author.find(searchOptions);
        res.render("authors/index", {
            allAuthors: allAuthors,
            searchOptions: req.query
         });
    } catch (error) {
        res.redirect("/");
    }
})

//new author route
router.get("/new", (req, res) => {
    res.render("authors/new", { author: new Author() });
})

//create author route
router.post("/", async (req, res) => {
    const author = new Author({
        name: req.body.name
    });
    try {
        const newAuthor = await author.save();
        //res.redirect(`authors/${newAuthor.id}`);
        res.redirect("authors/");
    } catch (error) {
        res.render("authors/new", {
            author: author,
            errorMessage: "Error creating Author"
        })
    }
})
module.exports = router;