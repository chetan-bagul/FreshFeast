const mongoose = require("mongoose");

const deliveryTaskSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["assigned", "picked_up", "in_transit", "delivered"],
      default: "assigned",
    },
    deliveredAt: Date,
    earnings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeliveryTask", deliveryTaskSchema);
