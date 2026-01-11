const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Adjust path if needed

// ----------------- CONFIG -----------------
const MONGO_URI = "mongodb+srv://elsajohn1712_db_user:WuN5UiomUIntfroc@project.8c8yrpq.mongodb.net/project?appName=project"; // Replace with your DB name
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123";

const createAdmin = async () => {
  try {
    console.log("Connecting to MongoDB...");
    
    // CONNECT without old options
    await mongoose.connect(MONGO_URI); 

    console.log("MongoDB connected");

    // Remove old admin if exists
    await User.deleteOne({ email: ADMIN_EMAIL });

    // Hash password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Create admin
    const admin = await User.create({
      name: 'Admin',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      favorites: [],
      rentedBooks: [],
      phone: "",
      address: {},
    });

    console.log("Admin created successfully!");
    console.log("Admin details:", {
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      favorites: admin.favorites,
      rentedBooks: admin.rentedBooks
    });

  } catch (err) {
    console.error("Error creating admin:", err);
  } finally {
    mongoose.disconnect();
  }
};

createAdmin();
