const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Book = require("../models/Book");
const User = require("../models/User");
const auth = require("../middleware/auth");

// ----------------- GET RANDOM 20 BOOKS -----------------
router.get("/", async (req, res) => {
  try {
    // Fetch 20 random books
    const books = await Book.aggregate([{ $sample: { size: 20 } }]);

    // Get all rented books by any user with status 'active'
    const users = await User.find({ "rentedBooks.status": "active" }).select("rentedBooks");
    const rentedBookIds = new Set();

    users.forEach((user) => {
      user.rentedBooks.forEach((r) => {
        if (r.status === "active") rentedBookIds.add(r.book.toString());
      });
    });

    // Add isRented flag to each book
    const booksWithStatus = books.map((b) => ({
      ...b,
      isRented: rentedBookIds.has(b._id.toString())
    }));

    res.json({ books: booksWithStatus });
  } catch (err) {
    console.error("GET BOOKS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------- GET USER BOOKS (Liked + Rented) -----------------
router.get("/mybooks", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("rentedBooks.book");

    if (!user) return res.status(404).json({ message: "User not found" });

    // Liked books
    const likedBookIds = user.favorites.map(id => id.toString());
    const likedBooks = await Book.find({ _id: { $in: likedBookIds } });

    // Rented books with status & returnDate
    const rentedBooks = user.rentedBooks.map(rb => {
      const book = rb.book;
      return {
        _id: book._id,
        title: book.title,
        author: book.author,
        imageUrl: book.imageUrl,
        status: rb.status,
        rentalDate: rb.rentalDate,
        returnDate: rb.returnDate,
      };
    });

    res.json({ liked: likedBooks, rented: rentedBooks });
  } catch (err) {
    console.error("GET MYBOOKS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch user books" });
  }
});

// ----------------- GET SINGLE BOOK -----------------
router.get("/:bookId", async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json({ book });
  } catch (err) {
    console.error("GET BOOK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/books - Add a new book
router.post("/", auth, async (req, res) => {
  try {
    const {
      title, author, publishedYear, genre, ISBN,
      description, imageUrl, price, rentalPrice
    } = req.body;

    if (!title || !author || !publishedYear || !genre || !ISBN) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newBook = new Book({
      title,
      author,
      publishedYear,
      genre,
      ISBN,
      description,
      imageUrl,
      price: price || 0,
      rentalPrice: rentalPrice || 0
    });

    const savedBook = await newBook.save();
    res.status(201).json({ book: savedBook });
  } catch (err) {
    console.error("CREATE BOOK ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT /api/books/:id - Update a book
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = { ...req.body };

    // Safeguard likes
    if (updatedData.likes === undefined || Array.isArray(updatedData.likes)) {
      updatedData.likes = 0;
    } else {
      updatedData.likes = Number(updatedData.likes);
      if (isNaN(updatedData.likes)) updatedData.likes = 0;
    }

    // Sanitize other numeric fields if needed
    if (updatedData.quantity !== undefined) {
      updatedData.quantity = Number(updatedData.quantity);
      if (isNaN(updatedData.quantity)) updatedData.quantity = 0;
    }

    const book = await Book.findByIdAndUpdate(id, updatedData, { new: true });
    if (!book) return res.status(404).json({ message: "Book not found" });

    res.json(book);
  } catch (err) {
    console.error("Update book error:", err);
    res.status(500).json({ error: "Failed to update book" });
  }
});

// ----------------- ADMIN DELETE BOOK -----------------
router.delete("/:bookId", auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const deletedBook = await Book.findByIdAndDelete(req.params.bookId);
    if (!deletedBook) return res.status(404).json({ message: "Book not found" });

    res.json({ message: "Book deleted" });
  } catch (err) {
    console.error("DELETE BOOK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// LIKE / UNLIKE a book (WITH COUNT)
router.post("/:id/like", auth, async (req, res) => {
  try {
    const bookId = req.params.id;
    const user = await User.findById(req.user.id);
    const book = await Book.findById(bookId);

    if (!user || !book)
      return res.status(404).json({ message: "User or Book not found" });

    let liked;
    if (user.favorites.includes(bookId)) {
      user.favorites = user.favorites.filter(b => b.toString() !== bookId);
      book.likes = Math.max(0, book.likes - 1);
      liked = false;
    } else {
      user.favorites.push(bookId);
      book.likes += 1;
      liked = true;
    }

    await user.save();
    await book.save();

    res.json({ liked, likes: book.likes });
  } catch (err) {
    console.error("LIKE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// RENTAL REQUEST
router.post("/:id/rent", auth, async (req, res) => {
  try {
    const bookId = req.params.id;
    const user = await User.findById(req.user.id);
    const book = await Book.findById(bookId);

    if (!user || !book) return res.status(404).json({ message: "User or book not found" });

    const existing = user.rentedBooks.find(r => r.book.toString() === bookId);
    if (existing) return res.status(400).json({ message: "You have already requested/rented this book" });

    user.rentedBooks.push({
      book: bookId,
      status: "pending",
      rentalDate: new Date(),
      returnDate: null
    });

    await user.save();
    res.json({ message: "Rental request sent!", status: "pending" });
  } catch (err) {
    console.error("Rental request error:", err);
    res.status(500).json({ message: "Request failed" });
  }
});

// ADD COMMENT
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const bookId = req.params.id;
    const { text } = req.body;
    const book = await Book.findById(bookId);

    if (!book) return res.status(404).json({ message: "Book not found" });

    const comment = { user: req.user.id, text, createdAt: new Date() };
    if (!book.comments) book.comments = [];
    book.comments.push(comment);

    await book.save();
    res.json({ comment });
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ message: "Failed to add comment" });
  }
});

module.exports = router;
