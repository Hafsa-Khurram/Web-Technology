const mongoose = require("mongoose");

const CATEGORIES = ["Beach", "Adventure", "Culture", "City", "Nature", "Luxury"];

const packageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    destination: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    category: { type: String, enum: CATEGORIES, default: "Nature" },
    description: { type: String, required: true, maxlength: 3000 },
    highlights: [{ type: String, trim: true }],
    price: { type: Number, required: true, min: 0 }, // per traveller
    durationDays: { type: Number, required: true, min: 1 },
    seats: { type: Number, default: 20, min: 0 }, // seats per departure
    image: { type: String, default: "/images/bg-1.jpg" },
    isActive: { type: Boolean, default: true },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

packageSchema.index({ title: "text", destination: "text", country: "text" });

module.exports = mongoose.model("Package", packageSchema);
module.exports.CATEGORIES = CATEGORIES;
