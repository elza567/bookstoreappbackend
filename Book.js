const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  publishedYear: { type: Number, required: true },
  genre: { type: String, required: true },
  ISBN: { type: String, required: true },
  imageUrl: String,
  description: String,
  price: { type: Number, default: 0 },
  rentalPrice: { type: Number, default: 0 },
  isRented: { type: Boolean, default: false },

  // ✅ LIKE COUNT (IMPORTANT)
  likes: {
    type: Number,
    default: 0
  },

  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model("Book", bookSchema);
