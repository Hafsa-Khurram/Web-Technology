const mongoose = require("mongoose");

const STATUSES = ["pending", "confirmed", "completed", "cancelled"];
const PAYMENT_METHODS = ["cash", "card", "bank-transfer", "easypaisa", "jazzcash"];

const transactionSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0.01 },
    method: { type: String, enum: PAYMENT_METHODS, default: "cash" },
    reference: { type: String, trim: true, default: "" },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingRef: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: "Package", required: true },
    travelers: { type: Number, required: true, min: 1, max: 20 },
    travelDate: { type: Date, required: true },
    contactPhone: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, maxlength: 500, default: "" },
    status: { type: String, enum: STATUSES, default: "pending" },

    // Pricing (snapshot at time of booking so later price edits don't change old bookings)
    unitPrice: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    discountCode: { type: String, default: "" },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    discountAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },

    payments: [transactionSchema],
    amountPaid: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid", "refunded"],
      default: "unpaid",
    },

    invoiceNumber: { type: String },
    cancelledAt: Date,
    feedbackGiven: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Recalculate totals and payment status
bookingSchema.methods.recalculate = function recalculate() {
  this.subtotal = round(this.unitPrice * this.travelers);
  this.discountAmount = round((this.subtotal * (this.discountPercent || 0)) / 100);
  this.total = round(this.subtotal - this.discountAmount);
  this.amountPaid = round(this.payments.reduce((s, p) => s + p.amount, 0));
  if (this.paymentStatus !== "refunded") {
    if (this.amountPaid <= 0) this.paymentStatus = "unpaid";
    else if (this.amountPaid + 0.001 < this.total) this.paymentStatus = "partial";
    else this.paymentStatus = "paid";
  }
};

bookingSchema.pre("validate", function setRefs(next) {
  if (!this.bookingRef) {
    const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
    this.bookingRef = `GT-${Date.now().toString(36).toUpperCase().slice(-5)}${rand}`;
  }
  if (!this.invoiceNumber) {
    const d = new Date();
    this.invoiceNumber = `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}-${this.bookingRef.slice(3)}`;
  }
  next();
});

function round(n) {
  return Math.round(n * 100) / 100;
}

module.exports = mongoose.model("Booking", bookingSchema);
module.exports.STATUSES = STATUSES;
module.exports.PAYMENT_METHODS = PAYMENT_METHODS;
