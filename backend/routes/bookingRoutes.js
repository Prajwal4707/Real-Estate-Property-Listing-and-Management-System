import express from "express";
import { verifyAdmin } from "../middleware/adminMiddleware.js";
import { protect as protectRoute } from "../middleware/authmiddleware.js";
import {
  getBookedProperties,
  bookProperty,
  cancelBooking,
} from "../controller/bookingController.js";

const router = express.Router();

// Admin routes
router.get("/booked", protectRoute, verifyAdmin, getBookedProperties);
router.post("/book", protectRoute, verifyAdmin, bookProperty);
router.delete("/:propertyId/cancel", protectRoute, verifyAdmin, cancelBooking);

export default router;
