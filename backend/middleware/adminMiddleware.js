// Check if user is an admin
export const isAdmin = async (req, res, next) => {
  try {
    // User object is attached by protectRoute middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    // Check if user is an admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can access this resource",
      });
    }

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking admin status",
    });
  }
};
