const mongoose = require("mongoose");

async function connectDB() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing. Add it to server/.env before starting the API.");
    }
    console.log("Connecting to MongoDB...");
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      retryWrites: true,
      w: "majority",
      appName: "FreshFeast",
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    const serverErrors = err.reason?.servers
      ? [...err.reason.servers.entries()].map(([host, detail]) => `${host}: ${detail.error?.message || detail.type || "unavailable"}`)
      : [];
    if (serverErrors.length) console.error(`Atlas node details: ${serverErrors.join(" | ")}`);
    console.error("The API cannot support login or menu data until MongoDB is connected.");
    process.exit(1);
  }
}

module.exports = connectDB;
