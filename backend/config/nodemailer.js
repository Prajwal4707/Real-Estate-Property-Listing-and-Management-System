import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
  defaults: {
    from: `BuildEstate <${process.env.EMAIL}>`, // Format: "Name <email>"
  },
});

// Verify the connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log("Error with email configuration:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

export default transporter;
