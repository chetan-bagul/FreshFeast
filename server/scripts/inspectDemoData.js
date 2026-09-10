require("dotenv").config();

const dns = require("dns");
const mongoose = require("mongoose");
const User = require("../src/models/User");
const Kitchen = require("../src/models/Kitchen");
const Dish = require("../src/models/Dish");
const Order = require("../src/models/Order");

const dnsServers = process.env.DNS_SERVERS?.split(",").map((server) => server.trim()).filter(Boolean);
if (dnsServers?.length) dns.setServers(dnsServers);

async function inspect() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email: "demo-kitchen@freshfeast.local" });
  const kitchens = user ? await Kitchen.find({ owner: user._id }).select("_id name") : [];
  const kitchenIds = kitchens.map((kitchen) => kitchen._id);
  const [dishCount, orderCount] = await Promise.all([
    kitchenIds.length ? Dish.countDocuments({ kitchen: { $in: kitchenIds } }) : 0,
    kitchenIds.length ? Order.countDocuments({ kitchen: { $in: kitchenIds } }) : 0,
  ]);
  console.log(JSON.stringify({ foundDemoUser: Boolean(user), kitchens, dishCount, orderCount }, null, 2));
}

inspect().finally(() => mongoose.disconnect());
