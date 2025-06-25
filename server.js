const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const { upload } = require("./cloudinary");
const authMiddleware = require("./middleware/authMiddleware");
require("dotenv").config();

const app = express();

// 👇 Add your deployed frontend domain here
const allowedOrigins = ["https://frontend-iota-ebon-74.vercel.app"];

app.use(express.json());


app.use((req, res, next) => {
  console.log("🔍 Origin:", req.headers.origin);
  next();
});

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));



app.use(require("./middleware/errorHandler"));

mongoose.connect(process.env.MONGODB_URI);

// 🎨 Painting model
const PaintingSchema = new mongoose.Schema({
  title: String,
  price: Number,
  imageUrl: String,
});

const Painting = mongoose.model("Painting", PaintingSchema);

// 👤 Register route (optional)
app.post("/register", async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.trim().toLowerCase();
    password = password.trim();
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User created" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Signup route (preferred)
app.post("/signup", async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.trim().toLowerCase();
    password = password.trim();
    if (!email || !password) throw new Error("Missing fields");

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User created" });
  } catch (error) {
    console.error("❌ Signup failed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 🔐 Login route
app.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.trim().toLowerCase();
    password = password.trim();

    console.log("🔐 Login attempt:");
    console.log("Email entered:", email);
    console.log("Password entered:", password);

    const user = await User.findOne({ email });
    console.log("User found in DB:", !!user);

    if (!user) return res.status(400).json({ message: "User not found" });

    console.log("Stored bcrypt hash:", user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match result:", isMatch);

    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    console.log("✅ Token created:", token);
    res.json({ token });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ message: err.message });
  }
});



// 🎨 Get all paintings
app.get("/paintings", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const paintings = await Painting.find()
    .limit(limit * 1)
    .skip((page - 1) * limit);
  res.json(paintings);
});

// 🖼️ Add a painting (protected route)
app.post("/paintings", authMiddleware, async (req, res) => {
  try {
    const newPainting = new Painting(req.body);
    await newPainting.save();
    res.status(201).json(newPainting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 📦 Image upload route
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

app.post("/reset-password", async (req, res) => {
  try {
    let { email, newPassword } = req.body;
    email = email.trim().toLowerCase();
    newPassword = newPassword.trim();

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 🚀 Start server
app.listen(5000, () => console.log("Server running on port 5000"));
