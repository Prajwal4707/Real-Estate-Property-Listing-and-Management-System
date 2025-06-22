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
        title: "Premium Apartment in Bandra",
        location: "Mumbai, Maharashtra",
        price: 85000000, // 8.5 Crores
        image: [
          "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3",
        ],
        beds: 3,
        baths: 2,
        sqft: 1500,
        type: "Apartment",
        availability: "Available",
        description:
          "A stunning luxury apartment in Bandra with sea view, modern design, and premium amenities.",
        amenities: ["Pool", "Gym", "Parking", "Elevator", "24/7 Security"],
        phone: "+91-982-555-1234",
      },
      {
        title: "Mountain View Villa in Shimla",
        location: "Shimla, Himachal Pradesh",
        price: 45000000, // 4.5 Crores
        image: [
          "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3",
        ],
        beds: 4,
        baths: 3,
        sqft: 3500,
        type: "Villa",
        availability: "Available",
        description:
          "A beautiful mountain villa with panoramic Himalayan views, perfect for luxury living.",
        amenities: [
          "Mountain View",
          "Fireplace",
          "Heated Flooring",
          "Modern Kitchen",
          "Private Garden",
        ],
        phone: "+91-981-555-6543",
      },
      {
        title: "Luxury Apartment in South Delhi",
        location: "New Delhi, India",
        price: 95000000, // 9.5 Crores
        image: [
          "https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?ixlib=rb-4.0.3",
        ],
        beds: 4,
        baths: 4,
        sqft: 2800,
        type: "Apartment",
        availability: "Available",
        description:
          "An elegant apartment in the heart of South Delhi with premium finishes and modern amenities.",
        amenities: ["Club House", "Doorman", "Parking", "Gym", "Swimming Pool"],
        phone: "+91-981-555-8101",
      },
      {
        title: "Luxury Villa in Jubilee Hills",
        location: "Hyderabad, India",
        price: 45000000, // 4.5 Crores
        image: [
          "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3",
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
        price: 120000000, // 12 Crores
        image: [
          "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3",
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
        price: 5500000, // 55 Lakhs
        image: [
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.0.3",
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
        location: "Bengaluru, India",
        price: 6000000, // 60 Lakhs
        image: [
          "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-4.0.3",
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
      {
        title: "Luxury Penthouse in Whitefield",
        location: "Bengaluru, India",
        price: 35000000, // 3.5 Crores
        image: [
          "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3",
        ],
        beds: 4,
        baths: 5,
        sqft: 3500,
        type: "Penthouse",
        availability: "Available",
        description:
          "Opulent penthouse in the upscale Whitefield area with private terrace, plunge pool, and luxurious interiors.",
        amenities: [
          "Private Pool",
          "Terrace",
          "Home Automation",
          "Modular Kitchen",
          "Servant Quarter",
          "24/7 Security",
        ],
        phone: "+91-900-000-0005",
      },
      {
        title: "Garden Villa in Koramangala",
        location: "Bengaluru, India",
        price: 5000000, // 50 Lakhs
        image: [
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
          "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b",
        ],
        beds: 5,
        baths: 6,
        sqft: 5000,
        type: "Villa",
        availability: "Available",
        description:
          "Luxurious villa with a sprawling garden, located in the prime area of Koramangala, featuring modern architecture and high-end finishes.",
        amenities: [
          "Garden",
          "Swimming Pool",
          "Gym",
          "Modular Kitchen",
          "Servant Quarter",
          "24/7 Security",
        ],
        phone: "+91-900-000-0006",
      },
      {
        title: "Premium Apartment in HSR Layout",
        location: "Bengaluru, India",
        price: 7500000, // 75 Lakhs
        image: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
          "https://images.unsplash.com/photo-1565182999561-18d7dc61c393",
        ],
        beds: 3,
        baths: 3,
        sqft: 2000,
        type: "Apartment",
        availability: "Available",
        description:
          "Spacious and modern apartment in HSR Layout, with easy access to major tech parks, schools, and hospitals.",
        amenities: [
          "Gym",
          "Swimming Pool",
          "Children's Play Area",
          "Club House",
          "24/7 Security",
        ],
        phone: "+91-900-000-0007",
      },
      {
        title: "Modern Studio Apartment in Pune",
        location: "Pune, Maharashtra",
        price: 6500000, // 65 Lakhs
        image: [
          "https://images.unsplash.com/photo-1574362848149-11496d93a7c7",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858",
        ],
        beds: 1,
        baths: 1,
        sqft: 600,
        type: "Apartment",
        availability: "Available",
        description:
          "A sleek and modern studio apartment in a prime area of Pune, perfect for bachelors or young couples.",
        amenities: [
          "Gym",
          "Lift",
          "24/7 Security",
          "Parking",
          "Intercom",
        ],
        phone: "+91-900-000-0010",
      },
      {
        title: "Spacious Bungalow in Chandigarh",
        location: "Chandigarh, Punjab",
        price: 28000000, // 2.8 Crores
        image: [
          "https://images.unsplash.com/photo-1580587771525-78b9dba3b914",
          "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf",
        ],
        beds: 4,
        baths: 4,
        sqft: 3000,
        type: "House",
        availability: "Available",
        description:
          "A spacious bungalow in a green and serene locality of Chandigarh, offering a blend of comfort and luxury.",
        amenities: [
          "Garden",
          "Parking",
          "Power Backup",
          "Modular Kitchen",
        ],
        phone: "+91-900-000-0009",
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
