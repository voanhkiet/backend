const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb+srv://voanhkiet261192:0p31FsTmKgk0BCLy@cluster.ebrd6fw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const PaintingSchema = new mongoose.Schema({
    title: String,
    price: Number,
    imageUrl: String,
});

const Painting = mongoose.model("Painting", PaintingSchema);

app.get("/paintings", async (req, res) => {
    const paintings = await Painting.find();
    res.json(paintings);
});