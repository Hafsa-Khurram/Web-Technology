const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    percent: { type: Number, required: true, min: 1, max: 90 },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

couponSchema.methods.isUsable = function isUsable() {
  return this.isActive && (!this.expiresAt || this.expiresAt > new Date());
};

module.exports = mongoose.model("Coupon", couponSchema);
