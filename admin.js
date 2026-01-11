const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

// ----------------- GET ALL USERS -----------------
router.get("/users", auth, adminOnly, async (req, res) => {
  const users = await User.find()
    .select("-password")
    .populate("rentedBooks.book favorites");

  res.json({ users });
});

// ----------------- BLOCK / UNBLOCK -----------------
router.patch("/users/:id/status", auth, adminOnly, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: req.body.isActive },
    { new: true }
  );

  res.json({ user });
});

// ----------------- DELETE USER -----------------
router.delete("/users/:id", auth, adminOnly, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

// ----------------- PENDING RENTALS -----------------
router.get("/rentals/pending", auth, adminOnly, async (req, res) => {
  const users = await User.find({ "rentedBooks.status": "pending" })
    .populate("rentedBooks.book");

  const pending = [];

  users.forEach(u =>
    u.rentedBooks.forEach(r => {
      if (r.status === "pending") {
        pending.push({
          userId: u._id,
          userName: u.name,
          bookId: r.book._id,
          bookTitle: r.book.title
        });
      }
    })
  );

  res.json({ pending });
});

// ----------------- APPROVE RENTAL -----------------
router.post("/rentals/:userId/:bookId/approve", auth, adminOnly, async (req, res) => {
  const user = await User.findById(req.params.userId);

  const rental = user.rentedBooks.find(
    r => r.book.toString() === req.params.bookId && r.status === "pending"
  );

  rental.status = "active";
  rental.rentalDate = new Date();
  rental.returnDate = new Date(Date.now() + 14 * 86400000);

  await user.save();
  res.json({ message: "Rental approved" });
});

// ----------------- DENY RENTAL -----------------
router.post(
  "/rentals/:userId/:bookId/deny",
  auth,
  adminOnly,
  async (req, res) => {
    const user = await User.findById(req.params.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.rentedBooks = user.rentedBooks.filter(
      r => r.book.toString() !== req.params.bookId
    );

    await user.save();
    res.json({ message: "Rental denied and removed" });
  }
);
 

module.exports = router;
