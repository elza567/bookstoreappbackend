const express = require("express");
const router = express.Router();
const Rental = require("../models/Rental");
const Book = require("../models/Book");
const auth = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
  try {
    const { bookId } = req.body;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (book.isRented) return res.status(400).json({ message: "Book already rented" });

    const rental = new Rental({
      user: req.user.id,
      book: bookId
    });

    await rental.save();
    res.json({ message: "Rental request sent", rental });
  } catch (err) {
    console.error("RENTAL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
