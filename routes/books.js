console.log("start");

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Book = require("../models/book");
const Author = require("../models/author");
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];
const uploadPath = path.join("public", Book.coverImageBasePath);
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})
//all books route - book search
router.get("/", async (req, res) => {
    const query = Book.find();
    if (req.query.title != null && req.query.title != "") {
        query.regex("title", new RegExp(req.query.title, "i"));
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != "") {
        query.lte("publishDate", req.query.publishedBefore);
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != "") {
        query.gte("publishDate", req.query.publishedAfter);
    }

    const books = await query.exec();
    try {
        res.render("books/index", {
            books: books,
            searchOptions: req.query
        });
    } catch {
        res.redirect("/");
    }

})

//new book route
router.get("/new", async (req, res) => {
    renderNewPage(res, new Book()); 
})

//create book route
router.post("/", upload.single("cover"), async (req, res) => {
    console.log("inside router.post");
 
    const fileName = req.file != null ? req.file.filename : null;
    console.log("1");
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    })
    console.log(book);
    console.log("2");
    try {
        const newBook = await book.save();
        //res.redirect(`books/${newBook.id}`);
        res.redirect("/books");
    } catch {
        if (book.coverImageName != null) {
            removeBookCover(book.coverImageName);
        }
        renderNewPage(res, book, true);
    }
})

function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), error => {
        if (error) console.error(error);
        console.log("The file was deleted");
    });
}

async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({});
        const params = {
            authors: authors,
            book: book
        };
        if (hasError) {
            params.errorMessage = "Error Creating Book";
        }
        res.render("books/new", params);
    } catch {
        res.redirect("/books");
    }
}
module.exports = router;
console.log("finish");
