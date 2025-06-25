const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const {upload} = require("./cloudinary"); // Assuming you have a cloudinary.js file for image uploads
const authMiddleware = require("./middleware/authMiddleware");
require('dotenv').config();
const app = express();


app.use(express.json());
app.use(cors());
app.use(require("./middleware/errorHandler"));

mongoose.connect(process.env.MONGODB_URI);

const PaintingSchema = new mongoose.Schema({
    title: String,
    price: Number, // Changed "Price" to "price"
    imageUrl: String,
});

const Painting = mongoose.model("Painting", PaintingSchema);

// Register route
app.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: "User already exists" });

        const newUser = new User({ email, password });
        await newUser.save();

        res.status(201).json({ message: "User created" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Login route
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({   email });
        if (!user) return res.status(400).json({ message: "User not found" }); // Fixed "credentails" to "credentials"

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { 
            expiresIn: "2h"
         });

         res.json({token});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get("/paintings", async (req, res) => {  // Fixed "asyns" to "async"
    const { page = 1, limit = 10} = req.query;
    const paintings = await Painting.find()
        .limit(limit * 1)
        .skip((page - 1) * limit);
    res.json(paintings);
});

app.post("/paintings", authMiddleware, async (req, res) => {
    try {
        const newPainting = new Painting(req.body);
        await newPainting.save();
        res.status(201).json(newPainting);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) throw new Error("No file uploaded!");
    console.log("✔️ Received file:", req.file);
    res.json({ imageUrl: req.file.path });
  } catch (error) {
    console.error("❌ Upload failed:", error);
    res.status(500).json({ message: error.message });
  }
});

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User already exists" });
  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
  const newUser = new User({ email, password: hashedPassword });
  await newUser.save();

  res.status(201).json({ message: "User created" });
});





app.listen(5000, () => console.log("Server running on port 5000"));