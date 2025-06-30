import connectdb from "../config/mongodb.js";
import Testimonial from "../models/testimonialModel.js";

const seedTestimonials = async () => {
  try {
    await connectdb();

    console.log("Clearing old testimonial data...");
    await Testimonial.deleteMany();

    console.log("Inserting sample testimonials...");
    const testimonials = [
      {
        name: "Prajwal A",
        email: "Prajwal.A@gmail.com",
        phone: "+91-9876543210",
        message: "BuildEstate helped me find my dream home in Bangalore. The process was smooth and the team was very supportive.",
        rating: 4,
        isApproved: true,
        isTestimonial: true
      },
      {
        name: "Priya Singh",
        email: "priya.singh@yahoo.com",
        phone: "+91-9123456789",
        message: "Excellent service! I was able to book a property in Pune without any hassle. Highly recommended.",
        rating: 5,
        isApproved: true,
        isTestimonial: true
      },
      {
        name: "Snehal Patil",
        email: "snehal.patil@gmail.com",
        phone: "+91-9876501234",
        message: "I found a great apartment in Mumbai through BuildEstate. The support team answered all my questions and made the process easy.",
        rating: 4,
        isApproved: true,
        isTestimonial: true
      },
      {
        name: "Vikram Rao",
        email: "vikram.rao@outlook.com",
        phone: "+91-9001122334",
        message: "Very satisfied with the service. The staff was responsive and guided me at every step.",
        rating: 5,
        isApproved: true,
        isTestimonial: true
      }
    ];

    const savedTestimonials = await Testimonial.insertMany(testimonials);
    console.log(`Successfully inserted ${savedTestimonials.length} testimonials`);

    // Display some statistics
    const approvedCount = await Testimonial.countDocuments({ isApproved: true });
    const pendingCount = await Testimonial.countDocuments({ isApproved: null });
    const rejectedCount = await Testimonial.countDocuments({ isApproved: false });
    
    console.log("\nTestimonial Statistics:");
    console.log(`Total Testimonials: ${testimonials.length}`);
    console.log(`Approved: ${approvedCount}`);
    console.log(`Pending: ${pendingCount}`);
    console.log(`Rejected: ${rejectedCount}`);

    console.log("\nSample testimonials seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding testimonials:", error);
    process.exit(1);
  }
};

seedTestimonials(); 