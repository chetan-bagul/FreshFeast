const Dish = require("../models/Dish");
const Kitchen = require("../models/Kitchen");
const asyncHandler = require("../utils/asyncHandler");
const { ApiError } = require("../middleware/errorHandler");

async function assertOwnsKitchen(kitchenId, userId) {
  const kitchen = await Kitchen.findById(kitchenId);
  if (!kitchen) throw new ApiError(404, "Kitchen not found");
  if (String(kitchen.owner) !== String(userId)) {
    throw new ApiError(403, "You do not own this kitchen");
  }
  return kitchen;
}

// POST /api/v1/kitchens/:kitchenId/dishes  (owner only)
const createDish = asyncHandler(async (req, res) => {
  await assertOwnsKitchen(req.params.kitchenId, req.user._id);

  const { name, description, price, category, imageUrl, isVeg } = req.body;
  if (!name || price === undefined) throw new ApiError(400, "name and price are required");

  const dish = await Dish.create({
    kitchen: req.params.kitchenId,
    name,
    description,
    price,
    category,
    imageUrl,
    isVeg,
  });

  res.status(201).json({ success: true, dish });
});

// GET /api/v1/kitchens/:kitchenId/dishes  (public)
const listDishesForKitchen = asyncHandler(async (req, res) => {
  const dishes = await Dish.find({ kitchen: req.params.kitchenId });
  res.json({ success: true, count: dishes.length, dishes });
});

// GET /api/v1/dishes/home-feed  (public — aggregated across all open kitchens)
const homeFeed = asyncHandler(async (req, res) => {
  const { category, search, pincode } = req.query;

  const kitchenFilter = { status: "approved", isOpen: true };
  if (pincode) kitchenFilter["location.pincode"] = String(pincode).trim();
  const openKitchens = await Kitchen.find(kitchenFilter).select("_id");
  const kitchenIds = openKitchens.map((k) => k._id);

  const filter = { kitchen: { $in: kitchenIds }, isAvailable: true };
  if (category) filter.category = category;
  if (search) filter.name = new RegExp(search, "i");

  const dishes = await Dish.find(filter).populate("kitchen", "name location rating").limit(100);
  res.json({ success: true, count: dishes.length, dishes });
});

// PUT /api/v1/dishes/:id  (owner only)
const updateDish = asyncHandler(async (req, res) => {
  const dish = await Dish.findById(req.params.id);
  if (!dish) throw new ApiError(404, "Dish not found");
  await assertOwnsKitchen(dish.kitchen, req.user._id);

  const allowedFields = ["name", "description", "price", "category", "imageUrl", "isVeg"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) dish[field] = req.body[field];
  });

  await dish.save();
  res.json({ success: true, dish });
});

// PATCH /api/v1/dishes/:id/availability  (owner only)
const toggleAvailability = asyncHandler(async (req, res) => {
  const dish = await Dish.findById(req.params.id);
  if (!dish) throw new ApiError(404, "Dish not found");
  await assertOwnsKitchen(dish.kitchen, req.user._id);

  dish.isAvailable = req.body.isAvailable !== undefined ? req.body.isAvailable : !dish.isAvailable;
  await dish.save();
  res.json({ success: true, dish });
});

// DELETE /api/v1/dishes/:id  (owner only)
const deleteDish = asyncHandler(async (req, res) => {
  const dish = await Dish.findById(req.params.id);
  if (!dish) throw new ApiError(404, "Dish not found");
  await assertOwnsKitchen(dish.kitchen, req.user._id);

  await dish.deleteOne();
  res.json({ success: true, message: "Dish deleted" });
});

module.exports = {
  createDish,
  listDishesForKitchen,
  homeFeed,
  updateDish,
  toggleAvailability,
  deleteDish,
};
