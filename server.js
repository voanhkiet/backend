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

app.use(require("./middleware/errorHandler"));



app.listen(5000, () => console.log("Server running on port 5000"));