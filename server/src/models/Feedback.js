const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: "Package", required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000, default: "" },
  },
  { timestamps: true }
);

// Keep the package's average rating up to date
feedbackSchema.statics.refreshPackageRating = async function refresh(packageId) {
  const Package = mongoose.model("Package");
  const rows = await this.find({ package: packageId }).select("rating").lean();
  const count = rows.length;
  const avg = count ? rows.reduce((s, r) => s + r.rating, 0) / count : 0;
  await Package.findByIdAndUpdate(packageId, {
    ratingAvg: Math.round(avg * 10) / 10,
    ratingCount: count,
  });
};

module.exports = mongoose.model("Feedback", feedbackSchema);
