const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');



// GET logged-in user profile (for edit page)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('favorites')
      .populate('rentedBooks.book');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('PROFILE ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE logged-in user profile
router.put('/me', auth, async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, phone, address },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json({ user: updatedUser });
  } catch (err) {
    console.error('UPDATE PROFILE ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET user wishlist
router.get('/me/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    res.json({ books: user.favorites });
  } catch (err) {
    console.error('FAVORITES ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET user rented books
router.get('/me/rented', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('rentedBooks.book');
    res.json({ books: user.rentedBooks });
  } catch (err) {
    console.error('RENTED BOOKS ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

// ADMIN ONLY MIDDLEWARE
const aadminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  next();
};

/// BLOCK / UNBLOCK USER
router.patch("/users/:id/status", auth, adminOnly, async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: isActive ? "User unblocked" : "User blocked", user });
  } catch (err) {
    console.error("BLOCK USER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;


module.exports = router;
