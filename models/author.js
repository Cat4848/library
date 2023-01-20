const mongoose = require("mongoose");
const Book = require("./book");
const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

authorSchema.pre("remove", async function(next) {
    let books;
    try {
        books = await Book.find({ author: this.id });
        console.log(books);
    } catch (error) {
        if (error) {
            next(error);
        }
    }
    if (books.length > 0) {
        next(new Error("This author still has books associated"));
    } else {
        next();
    }
})
module.exports = mongoose.model("Author", authorSchema);