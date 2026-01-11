const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()

app.use(cors({
  origin: "http://localhost:5173", // frontend dev URL
  credentials: true,
}))

app.use(express.json())

// Auth routes
app.use('/api/auth', require('./routes/auth'))

// Admin routes (all admin CRUD)
app.use('/api/admin', require('./routes/admin'))

// Optional: user and book routes for normal users
 app.use('/api/books', require('./routes/books'))
 app.use('/api/users', require('./routes/users'))
 app.use("/api/rentals", require("./routes/rentals"));


mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err))

app.get('/', (req, res) => {
  res.json({ message: 'Bookstore API Running' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on ${PORT}`))
