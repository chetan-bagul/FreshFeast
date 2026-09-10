require("dotenv").config();

const dns = require("dns");
const mongoose = require("mongoose");
const User = require("../src/models/User");
const Kitchen = require("../src/models/Kitchen");
const Dish = require("../src/models/Dish");

const dnsServers = process.env.DNS_SERVERS?.split(",").map((server) => server.trim()).filter(Boolean);
if (dnsServers?.length) dns.setServers(dnsServers);

const menu = [
  {
    name: "Paneer Butter Masala",
    description: "Tender paneer cubes in a creamy tomato and butter gravy.",
    price: 249,
    category: "Main Course",
    imageUrl: "/images/paneer-butter-masala.png",
    isVeg: true,
  },
  {
    name: "Vegetable Biryani",
    description: "Aromatic basmati rice layered with vegetables and fragrant spices.",
    price: 219,
    category: "Rice & Biryani",
    imageUrl: "/images/vegetable-biryani.png",
    isVeg: true,
  },
];

async function seedMenu() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = "demo-kitchen@freshfeast.local";
  let owner = await User.findOne({ email });
  if (!owner) {
    owner = await User.create({
      name: "Fresh Feast Demo Kitchen",
      email,
      password: "demoKitchen123",
      role: "kitchen",
      phone: "9999999999",
    });
  }

  const kitchen = await Kitchen.findOneAndUpdate(
    { owner: owner._id, name: "Fresh Feast Kitchen" },
    {
      owner: owner._id,
      name: "Fresh Feast Kitchen",
      description: "Fresh vegetarian Indian meals, prepared daily.",
      location: { address: "MG Road", city: "Bengaluru", pincode: "425412" },
      status: "approved",
      isOpen: true,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await Promise.all(
    menu.map((dish) =>
      Dish.findOneAndUpdate(
        { kitchen: kitchen._id, name: dish.name },
        { ...dish, kitchen: kitchen._id, isAvailable: true },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      )
    )
  );

  console.log(`Seeded ${menu.length} dishes for ${kitchen.name}.`);
}

seedMenu()
  .catch((error) => {
    console.error("Menu seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
