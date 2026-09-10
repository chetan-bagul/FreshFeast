require("dotenv").config();
const dns = require("dns");
const http = require("http");
const { Server } = require("socket.io");
const app = require("./src/app");
const connectDB = require("./src/config/db");
const { initSockets } = require("./src/sockets");

// Some networks refuse Node's default DNS SRV lookups used by mongodb+srv.
// Configure resolvers in .env when needed (for example: 1.1.1.1,8.8.8.8).
const dnsServers = process.env.DNS_SERVERS?.split(",").map((server) => server.trim()).filter(Boolean);
if (dnsServers?.length) dns.setServers(dnsServers);

const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173,http://localhost:5174,http://localhost:5175")
  .split(",")
  .map((origin) => origin.trim());

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, credentials: true },
});

initSockets(io);
app.set("io", io); // lets controllers do req.app.get('io').to(room).emit(...)

httpServer.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the other API process before starting this server.`);
  } else {
    console.error("HTTP server error:", error.message);
  }
  process.exit(1);
});

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Fresh Feast API listening on port ${PORT}`);
  });
});
