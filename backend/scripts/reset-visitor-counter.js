import connectdb from "../config/mongodb.js";
import Visitor from "../models/visitorModel.js";

const resetVisitorCounter = async () => {
  try {
    await connectdb();
    console.log("Connected to MongoDB...");

    // Delete all visitor records
    const result = await Visitor.deleteMany({});
    
    console.log(`\n✅ Visitor counter reset successfully!`);
    console.log(`Deleted ${result.deletedCount} visitor records`);
    
    // Verify the reset
    const uniqueVisitors = await Visitor.getUniqueVisitors();
    const totalVisits = await Visitor.getTotalVisits();
    
    console.log("\n📊 Current Statistics:");
    console.log(`Unique Visitors: ${uniqueVisitors}`);
    console.log(`Total Visits: ${totalVisits}`);
    
    console.log("\n🎉 Visitor counter has been reset to 0!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting visitor counter:", error);
    process.exit(1);
  }
};

resetVisitorCounter(); 