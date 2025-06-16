import express from "express";
import {
  searchProperties,
  getLocationTrends,
  blockProperty,
  unblockProperty,
  verifyPayment,
  deleteProperty,
} from "../controller/propertyController.js";
import { verifyAdmin } from "../middleware/adminMiddleware.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

// Route to search for properties
router.post("/properties/search", searchProperties);

// Route to get location trends
router.get("/locations/:city/trends", getLocationTrends);

// Admin routes for property management
router.put("/:id/block", protect, verifyAdmin, blockProperty);
router.put("/:id/unblock", protect, verifyAdmin, unblockProperty);
router.put("/:id/verify-payment", protect, verifyAdmin, verifyPayment);
router.delete("/:id", protect, verifyAdmin, deleteProperty);

export default router;
