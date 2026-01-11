const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  phone: String,
  address: {
    street: String,
    city: String,
    country: String,
  },
  isActive: { type: Boolean, default: true },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],  // liked books
 rentedBooks: [
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    rentalDate: { type: Date, default: Date.now },
    returnDate: Date,
    status: { type: String, enum: ['pending', 'active', 'returned'], default: 'pending' },
  },
],

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
