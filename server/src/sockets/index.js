// Room-based Socket.io setup: clients join rooms scoped to their user/kitchen id
// so events only reach the people who should see them.
function initSockets(io) {
  io.on("connection", (socket) => {
    socket.on("join:user", (userId) => socket.join(`user:${userId}`));
    socket.on("join:kitchen", (kitchenId) => socket.join(`kitchen:${kitchenId}`));

    socket.on("disconnect", () => {
      // no-op for now — rooms are cleaned up automatically by socket.io
    });
  });
}

// Helper controllers can call: emitToUser(io, userId, 'order:statusUpdate', payload)
function emitToRoom(io, room, event, payload) {
  io.to(room).emit(event, payload);
}

module.exports = { initSockets, emitToRoom };
