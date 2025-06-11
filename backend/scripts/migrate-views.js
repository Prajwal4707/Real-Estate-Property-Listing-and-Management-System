import connectdb from "../config/mongodb.js";
import Property from "../models/propertymodel.js";

const migrateViews = async () => {
  try {
    await connectdb();
    console.log("Connected to MongoDB...");

    // Get all properties that don't have a views field
    const properties = await Property.find({ views: { $exists: false } });
    console.log(`Found ${properties.length} properties without views...`);

    // Update each property to add views field
    for (const property of properties) {
      property.views = 0;
      await property.save();
    }

    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateViews();
