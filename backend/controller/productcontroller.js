import fs from "fs";
import imagekit from "../config/imagekit.js";
import Property from "../models/propertymodel.js";
import path from "path";
import User from '../models/Usermodel.js';
import News from '../models/newsmodel.js';
import transporter from '../config/nodemailer.js';
import { getNewPropertyEmailTemplate } from '../email.js';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const addproperty = async (req, res) => {
  try {
    const {
      title,
      location,
      price,
      beds,
      baths,
      sqft,
      type,
      availability,
      description,
      amenities,
      phone,
    } = req.body; // Parse amenities if it's a string
    let parsedAmenities = [];
    try {
      if (typeof amenities === "string") {
        // If it's a JSON string
        if (amenities.trim().startsWith("[")) {
          parsedAmenities = JSON.parse(amenities);
        } else {
          // If it's a comma-separated string
          parsedAmenities = amenities.split(",").map((item) => item.trim());
        }
      } else if (Array.isArray(amenities)) {
        parsedAmenities = amenities;
      } else if (amenities) {
        parsedAmenities = [amenities.toString()];
      }
    } catch (error) {
      console.error("Error parsing amenities:", error);
      parsedAmenities = [];
    }

    // Check if files exist in the request
    if (!req.files) {
      return res
        .status(400)
        .json({ message: "No images provided", success: false });
    }

    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined
    );

    if (images.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required", success: false });
    }

    // Upload images to ImageKit and delete after upload
    const imageUrls = await Promise.all(
      images.map(async (item) => {
        try {
          if (!fs.existsSync(item.path)) {
            throw new Error(`File not found: ${item.path}`);
          }

          const result = await imagekit.upload({
            file: fs.readFileSync(item.path),
            fileName: item.originalname,
            folder: "Property",
          });

          // Delete the temporary file
          try {
            fs.unlinkSync(item.path);
          } catch (unlinkError) {
            console.log("Error deleting temporary file:", unlinkError);
          }

          return result.url;
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          throw new Error(`Failed to upload image: ${item.originalname}`);
        }
      })
    );

    // Create a new product
    const product = new Property({
      title,
      location,
      price,
      beds,
      baths,
      sqft,
      type,
      availability,
      description,
      amenities: parsedAmenities,
      image: imageUrls,
      phone,
    });

    // Save the product to the database
    await product.save();

    // Send notification emails to all users and newsletter subscribers
    try {
      // Fetch all user emails
      const users = await User.find({}, 'email');
      // Fetch all newsletter emails
      const subscribers = await News.find({}, 'email');
      // Combine and deduplicate emails
      const allEmails = Array.from(new Set([
        ...users.map(u => u.email),
        ...subscribers.map(s => s.email)
      ]));
      // Property link (customize as needed)
      const propertyLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/properties`;
      // Send one email per recipient
      for (const email of allEmails) {
        await transporter.sendMail({
          from: `BuildEstate <${process.env.EMAIL}>`,
          to: email,
          subject: `New Property Listed: ${title}`,
          html: getNewPropertyEmailTemplate(title, location, propertyLink),
        });
      }
    } catch (mailError) {
      console.error('Error sending new property notification emails:', mailError);
    }

    res.json({ message: "Property added successfully", success: true });
  } catch (error) {
    console.error("Error adding product: ", error);
    res.status(500).json({
      message: error.message || "Server Error",
      success: false,
    });
  }
};

const listproperty = async (req, res) => {
  try {
    // Only get properties that are not blocked
    const property = await Property.find({ isBlocked: { $ne: true } });
    res.json({ property, success: true });
  } catch (error) {
    console.log("Error listing products: ", error);
    res.status(500).json({ message: "Server Error", success: false });
  }
};

const removeproperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.body.id);
    if (!property) {
      return res
        .status(404)
        .json({ message: "Property not found", success: false });
    }
    return res.json({
      message: "Property removed successfully",
      success: true,
    });
  } catch (error) {
    console.log("Error removing product: ", error);
    return res.status(500).json({ message: "Server Error", success: false });
  }
};

const updateproperty = async (req, res) => {
  try {
    const {
      id,
      title,
      location,
      price,
      beds,
      baths,
      sqft,
      type,
      availability,
      description,
      amenities,
      phone,
    } = req.body;

    const property = await Property.findById(id);
    if (!property) {
      console.log("Property not found with ID:", id); // Debugging line
      return res
        .status(404)
        .json({ message: "Property not found", success: false });
    }

    if (!req.files) {
      // No new images provided
      property.title = title;
      property.location = location;
      property.price = price;
      property.beds = beds;
      property.baths = baths;
      property.sqft = sqft;
      property.type = type;
      property.availability = availability;
      property.description = description;
      property.amenities = amenities;
      property.phone = phone;
      // Keep existing images
      await property.save();
      return res.json({
        message: "Property updated successfully",
        success: true,
      });
    }

    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined
    );

    // Upload images to ImageKit and delete after upload
    const imageUrls = await Promise.all(
      images.map(async (item) => {
        const result = await imagekit.upload({
          file: fs.readFileSync(item.path),
          fileName: item.originalname,
          folder: "Property",
        });
        fs.unlink(item.path, (err) => {
          if (err) console.log("Error deleting the file: ", err);
        });
        return result.url;
      })
    );

    property.title = title;
    property.location = location;
    property.price = price;
    property.beds = beds;
    property.baths = baths;
    property.sqft = sqft;
    property.type = type;
    property.availability = availability;
    property.description = description;
    property.amenities = amenities;
    property.image = imageUrls;
    property.phone = phone;

    await property.save();
    res.json({ message: "Property updated successfully", success: true });
  } catch (error) {
    console.log("Error updating product: ", error);
    res.status(500).json({ message: "Server Error", success: false });
  }
};

const singleproperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found", success: false });
    }

    // Increment views and add current date to viewDates
    property.views += 1;
    property.viewDates.push(new Date());
    await property.save();

    res.json({ property, success: true });
  } catch (error) {
    console.log("Error fetching single product: ", error);
    res.status(500).json({ message: "Server Error", success: false });
  }
};

export {
  addproperty,
  listproperty,
  removeproperty,
  updateproperty,
  singleproperty,
};
