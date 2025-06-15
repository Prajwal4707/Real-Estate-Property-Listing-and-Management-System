import express from "express";
import {
  searchProperties,
  getLocationTrends,
  blockProperty,
  unblockProperty,
  verifyPayment,
} from "../controller/propertyController.js";
import { verifyAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Route to search for properties
router.post("/properties/search", searchProperties);

// Route to get location trends
router.get("/locations/:city/trends", getLocationTrends);

// Admin routes for property management
router.put("/:id/block", verifyAdmin, blockProperty);
router.put("/:id/unblock", verifyAdmin, unblockProperty);
router.put("/:id/verify-payment", verifyAdmin, verifyPayment);

export default router;
