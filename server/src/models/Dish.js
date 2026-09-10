const mongoose = require("mongoose");

const dishSchema = new mongoose.Schema(
  {
    kitchen: { type: mongoose.Schema.Types.ObjectId, ref: "Kitchen", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: String,
    price: { type: Number, required: true, min: 0 },
    category: { type: String, default: "General" },
    imageUrl: String,
    isAvailable: { type: Boolean, default: true },
    isVeg: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Dish", dishSchema);
