const { ApiError } = require("./errorHandler");

// Usage: router.post('/kitchens', authMiddleware, requireRole(['kitchen']), createKitchen)
function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) throw new ApiError(401, "Not authenticated");
    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, `Role '${req.user.role}' is not permitted to perform this action`);
    }
    next();
  };
}

module.exports = requireRole;
