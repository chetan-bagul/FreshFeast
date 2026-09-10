const mongoose = require("mongoose");

const kitchenSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: String,
    location: {
      address: String,
      city: String,
      pincode: { type: String, trim: true, index: true },
      lat: Number,
      lng: Number,
    },
    coverImageUrl: String,
    status: { type: String, enum: ["pending", "approved", "suspended"], default: "pending" },
    rating: {
      avg: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    isOpen: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Kitchen", kitchenSchema);
