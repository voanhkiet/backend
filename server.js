/* eslint-disable no-undef */
const express = require("express");
const cors = require("cors");

const mongoose = require("mongoose");
require("dotenv").config();
const app = express();
app.use(express.static("public"));
// Ensure that images can be accessed
app.use("/images", express.static(__dirname + "public/images"));
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.once("open", async () => {
  try {
    await mongoose.connection.db.collection("paintings").drop();
    console.log("✅ Database deleted successfully!");
  } catch (error) {
    console.error("❌ Error deleting database:", error);
  }
});
const paintingSchema = new mongoose.Schema({
  title: String,
  image: String,
  price: Number,
});
const samplePaintings = [
  {
    title: "Sunset",
    image: "https://backend-ybh5.onrender.com/images/sunset.jpg",

    price: 100,
  },
  {
    title: "Ocean",
    image: "https://backend-ybh5.onrender.com/images/ocean.jpg",

    price: 150,
  },
];
const Painting = mongoose.model("Painting", paintingSchema);

// API Routes
app.get("/paintings", async (req, res) => {
  const paintings = await Painting.find();
  res.json(paintings);
});
Painting.insertMany(samplePaintings)
  .then(() => console.log("✅ Sample paintings added!"))
  .catch((err) => console.error("❌ Error inserting paintings:", err));
app.listen(5000, () => console.log("Backend running on port 5000"));
