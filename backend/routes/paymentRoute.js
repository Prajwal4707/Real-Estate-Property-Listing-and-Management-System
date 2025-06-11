import express from "express";
import protect from "../middleware/authmiddleware.js";
import { createOrder, verifyPayment } from "../controller/paymentController.js";

const paymentRoutes = express.Router();

// Payment routes
paymentRoutes.post("/create-order", protect, createOrder);
paymentRoutes.post("/verify-payment", protect, verifyPayment);

export { paymentRoutes };
