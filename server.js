const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const PaintingSchema = new mongoose.Schema({
    title: String,
    price: Number, // Changed "Price" to "price"
    imageUrl: String,
});

const Painting = mongoose.model("Painting", PaintingSchema);

app.get("/paintings", async (req, res) => {  // Fixed "asyns" to "async"
    const paintings = await Painting.find();
    res.json(paintings);
});

app.listen(5000, () => console.log("Server running on port 5000"));