require("dotenv").config();

const dns = require("dns");
const mongoose = require("mongoose");
const User = require("../src/models/User");
const Kitchen = require("../src/models/Kitchen");
const Dish = require("../src/models/Dish");

const dnsServers = process.env.DNS_SERVERS?.split(",").map((server) => server.trim()).filter(Boolean);
if (dnsServers?.length) dns.setServers(dnsServers);

async function removeDemoDishes() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email: "demo-kitchen@freshfeast.local" });
  if (!user) return console.log("No demo user found; no dishes deleted.");

  const kitchens = await Kitchen.find({ owner: user._id }).select("_id");
  const kitchenIds = kitchens.map((kitchen) => kitchen._id);
  const result = await Dish.deleteMany({ kitchen: { $in: kitchenIds } });
  console.log(`Deleted ${result.deletedCount} demo dishes.`);
}

removeDemoDishes()
  .catch((error) => { console.error("Demo-dish cleanup failed:", error.message); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
