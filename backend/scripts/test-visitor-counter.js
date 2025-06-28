import connectdb from "../config/mongodb.js";
import Visitor from "../models/visitorModel.js";

const testVisitorCounter = async () => {
  try {
    await connectdb();
    console.log("Connected to MongoDB...");

    // Test visitor tracking
    console.log("Testing visitor tracking...");
    
    const testIPs = [
      "192.168.1.1",
      "192.168.1.2", 
      "10.0.0.1",
      "172.16.0.1"
    ];

    const testUserAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15"
    ];

    // Simulate multiple visits
    for (let i = 0; i < 10; i++) {
      const randomIP = testIPs[Math.floor(Math.random() * testIPs.length)];
      const randomUA = testUserAgents[Math.floor(Math.random() * testUserAgents.length)];
      
      const result = await Visitor.trackVisit(randomIP, randomUA);
      console.log(`Visit ${i + 1}: ${result.isNew ? 'New' : 'Returning'} visitor`);
    }

    // Get statistics
    const uniqueVisitors = await Visitor.getUniqueVisitors();
    const totalVisits = await Visitor.getTotalVisits();
    
    console.log("\nVisitor Statistics:");
    console.log(`Unique Visitors: ${uniqueVisitors}`);
    console.log(`Total Visits: ${totalVisits}`);

    // Get all visitors
    const allVisitors = await Visitor.find().sort({ lastVisit: -1 });
    console.log("\nRecent Visitors:");
    allVisitors.slice(0, 5).forEach((visitor, index) => {
      console.log(`${index + 1}. IP: ${visitor.ipAddress} | Visits: ${visitor.visitCount} | Last: ${visitor.lastVisit}`);
    });

    console.log("\nVisitor counter test completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
};

testVisitorCounter(); 