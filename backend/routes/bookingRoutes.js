import express from "express";
import { isAdmin } from "../middleware/adminMiddleware.js";
import { protect as protectRoute } from "../middleware/authmiddleware.js";
import {
  getBookedProperties,
  bookProperty,
  cancelBooking,
} from "../controller/bookingController.js";

const router = express.Router();

// Admin routes
router.get("/booked", protectRoute, isAdmin, getBookedProperties);
router.post("/book", protectRoute, isAdmin, bookProperty);
router.delete("/:propertyId/cancel", protectRoute, isAdmin, cancelBooking);

export default router;
