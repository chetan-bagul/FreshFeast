const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    dish: { type: mongoose.Schema.Types.ObjectId, ref: "Dish", required: true },
    name: String, // snapshot at order time, in case dish is later edited/deleted
    price: Number,
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    kitchen: { type: mongoose.Schema.Types.ObjectId, ref: "Kitchen", required: true, index: true },
    items: { type: [orderItemSchema], validate: (v) => v.length > 0 },
    // Defaults keep existing orders editable after this pricing field is introduced.
    subtotalAmount: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 20 },
    totalAmount: { type: Number, required: true },
    deliveryAddress: {
      line1: String,
      city: String,
      pincode: String,
      lat: Number,
      lng: Number,
    },
    deliveryAgent: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: {
      type: String,
      enum: ["placed", "confirmed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"],
      default: "placed",
      index: true,
    },
    payment: {
      method: { type: String, default: "cod" },
      status: { type: String, default: "pending" },
      transactionId: String,
    },
    cancelReason: String,
    deliveredAt: Date,
  },
  { timestamps: true } // createdAt doubles as placedAt
);

// Only allow cancellation while the kitchen hasn't started preparing yet
orderSchema.methods.isCancellable = function () {
  return ["placed", "confirmed"].includes(this.status);
};

module.exports = mongoose.model("Order", orderSchema);
