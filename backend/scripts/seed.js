import connectdb from "../config/mongodb.js";
import Property from "../models/propertymodel.js";

const seedProperties = async () => {
  try {
    await connectdb();

    console.log("Clearing old property data...");
    await Property.deleteMany();

    console.log("Inserting sample properties...");
    const properties = [
      {
        title: "Luxury Apartment in New York",
        location: "New York, USA",
        price: 750000,
        image: [
          "https://ik.imagekit.io/ddtl85xea/property1.jpg",
          "https://ik.imagekit.io/ddtl85xea/property2.jpg",
        ],
        beds: 3,
        baths: 2,
        sqft: 1500,
        type: "Apartment",
        availability: "Available",
        description:
          "A stunning luxury apartment with city views, modern design, and premium amenities.",
        amenities: ["Pool", "Gym", "Parking", "Elevator"],
        phone: "+1-555-123-4567",
      },
      {
        title: "Cozy Beach House",
        location: "Miami, USA",
        price: 850000,
        image: [
          "https://ik.imagekit.io/ddtl85xea/property3.jpg",
          "https://ik.imagekit.io/ddtl85xea/property4.jpg",
        ],
        beds: 4,
        baths: 3,
        sqft: 2000,
        type: "House",
        availability: "Available",
        description:
          "A cozy beach house with private access to the beach, perfect for family getaways.",
        amenities: ["Beach Access", "Deck", "Outdoor Shower", "Grill"],
        phone: "+1-555-987-6543",
      },
      {
        title: "Modern Condo",
        location: "San Francisco, USA",
        price: 950000,
        image: [
          "https://ik.imagekit.io/ddtl85xea/property5.jpg",
          "https://ik.imagekit.io/ddtl85xea/property6.jpg",
        ],
        beds: 2,
        baths: 2,
        sqft: 1200,
        type: "Condo",
        availability: "Available",
        description:
          "A modern condo located in the heart of the city with stunning skyline views.",
        amenities: ["Rooftop", "Doorman", "Parking", "Gym"],
        phone: "+1-555-246-8101",
      },
      {
        title: "Luxury Villa in Jubilee Hills",
        location: "Hyderabad, India",
        price: 45000000,
        image: [
          "https://ik.imagekit.io/ddtl85xea/property7.jpg",
          "https://ik.imagekit.io/ddtl85xea/property8.jpg",
        ],
        beds: 5,
        baths: 6,
        sqft: 4500,
        type: "Villa",
        availability: "Available",
        description:
          "Luxurious villa in the prestigious Jubilee Hills area with modern amenities, landscaped garden, and premium finishes.",
        amenities: [
          "Swimming Pool",
          "Home Theater",
          "Modular Kitchen",
          "Servant Quarter",
          "Garden",
          "Power Backup",
        ],
        phone: "+91-900-000-0001",
      },
      {
        title: "Sea-facing Apartment in Worli",
        location: "Mumbai, India",
        price: 120000000,
        image: [
          "https://ik.imagekit.io/ddtl85xea/property9.jpg",
          "https://ik.imagekit.io/ddtl85xea/property10.jpg",
        ],
        beds: 4,
        baths: 4,
        sqft: 2800,
        type: "Apartment",
        availability: "Available",
        description:
          "Premium sea-facing apartment in Worli with spectacular Arabian Sea views, high-end finishes, and world-class amenities.",
        amenities: [
          "Sea View",
          "Club House",
          "Valet Parking",
          "Gym",
          "Spa",
          "24/7 Security",
        ],
        phone: "+91-982-000-0002",
      },
      {
        title: "Contemporary Home in DLF Phase 1",
        location: "Gurgaon, India",
        price: 35000000,
        image: [
          "https://ik.imagekit.io/ddtl85xea/property11.jpg",
          "https://ik.imagekit.io/ddtl85xea/property12.jpg",
        ],
        beds: 4,
        baths: 4,
        sqft: 3200,
        type: "House",
        availability: "Available",
        description:
          "Modern independent house in DLF Phase 1 with contemporary design, spacious rooms, and premium amenities.",
        amenities: [
          "Terrace Garden",
          "Modular Kitchen",
          "Study Room",
          "Parking",
          "Security",
        ],
        phone: "+91-995-000-0003",
      },
      {
        title: "Premium Flat in Indiranagar",
        location: "Bangalore, India",
        price: 25000000,
        image: [
          "https://ik.imagekit.io/ddtl85xea/property13.jpg",
          "https://ik.imagekit.io/ddtl85xea/property14.jpg",
        ],
        beds: 3,
        baths: 3,
        sqft: 1800,
        type: "Apartment",
        availability: "Available",
        description:
          "Elegant apartment in the heart of Indiranagar with modern amenities, close to Metro station and commercial hubs.",
        amenities: [
          "Gym",
          "Covered Parking",
          "Children's Play Area",
          "Community Hall",
          "24/7 Security",
        ],
        phone: "+91-963-000-0004",
      },
    ];

    await Property.insertMany(properties);
    console.log("✅ Seed data inserted successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedProperties();
