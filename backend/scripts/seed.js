import connectdb from "../config/mongodb.js";
import Property from "../models/propertymodel.js";

const seedProperties = async () => {
  try {
    await connectdb();

    console.log("Clearing old property data...");
    await Property.deleteMany({ seeded: true });

    console.log("Inserting sample properties...");
    const properties = [
      {
        title: "Premium Apartment in Bandra",
        location: "Mumbai, Maharashtra",
        price: "85000000", // 8.5 Crores
        image: [
          "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3",
        ],
        beds: 3,
        baths: 2,
        sqft: 1500,
        type: "Apartment",
        availability: "For Sale",
        description:
          "A stunning luxury apartment in Bandra with sea view, modern design, and premium amenities.",
        amenities: ["Pool", "Gym", "Parking", "Elevator", "24/7 Security"],
        phone: "+91-982-555-1234",
        seeded: true,
      },
      {
        title: "Mountain View Villa in Shimla",
        location: "Shimla, Himachal Pradesh",
        price: "45000000", // 4.5 Crores
        image: [
          "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3",
        ],
        beds: 4,
        baths: 3,
        sqft: 3500,
        type: "Villa",
        availability: "For Sale",
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
        seeded: true,
      },
      {
        title: "Luxury Apartment in South Delhi",
        location: "New Delhi, India",
        price: "95000000", // 9.5 Crores
        image: [
          "https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?ixlib=rb-4.0.3",
        ],
        beds: 4,
        baths: 4,
        sqft: 2800,
        type: "Apartment",
        availability: "For Sale",
        description:
          "An elegant apartment in the heart of South Delhi with premium finishes and modern amenities.",
        amenities: ["Club House", "Doorman", "Parking", "Gym", "Swimming Pool"],
        phone: "+91-981-555-8101",
        seeded: true,
      },
      {
        title: "Luxury Villa in Jubilee Hills",
        location: "Hyderabad, India",
        price: "45000000", // 4.5 Crores
        image: [
          "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3",
        ],
        beds: 5,
        baths: 6,
        sqft: 4500,
        type: "Villa",
        availability: "For Sale",
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
        seeded: true,
      },
      {
        title: "Sea-facing Apartment in Worli",
        location: "Mumbai, India",
        price: "120000000", // 12 Crores
        image: [
          "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3",
        ],
        beds: 4,
        baths: 4,
        sqft: 2800,
        type: "Apartment",
        availability: "For Sale",
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
        seeded: true,
      },
      {
        title: "Contemporary Home in DLF Phase 1",
        location: "Gurgaon, India",
        price: "5500000", // 55 Lakhs
        image: [
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.0.3",
        ],
        beds: 4,
        baths: 4,
        sqft: 3200,
        type: "House",
        availability: "For Sale",
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
        seeded: true,
      },
      {
        title: "Premium Flat in Indiranagar",
        location: "Bengaluru, India",
        price: "6000000", // 60 Lakhs
        image: [
          "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-4.0.3",
        ],
        beds: 3,
        baths: 3,
        sqft: 1800,
        type: "Apartment",
        availability: "For Sale",
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
        seeded: true,
      },
      {
        title: "Luxury Penthouse in Whitefield",
        location: "Bengaluru, India",
        price: "35000000", // 3.5 Crores
        image: [
          "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3",
        ],
        beds: 4,
        baths: 5,
        sqft: 3500,
        type: "Penthouse",
        availability: "For Sale",
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
        seeded: true,
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
        availability: "For Sale",
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
        seeded: true,
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
        availability: "For Sale",
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
        seeded: true,
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
        availability: "For Sale",
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
        seeded: true,
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
        availability: "For Sale",
        description:
          "A spacious bungalow in a green and serene locality of Chandigarh, offering a blend of comfort and luxury.",
        amenities: [
          "Garden",
          "Parking",
          "Power Backup",
          "Modular Kitchen",
        ],
        phone: "+91-900-000-0009",
        seeded: true,
      },
      {
        title: "Ms Vardhaman Ventures Orionis Propus",
        location: "Angol, Belagavi",
        price: 4500000,
        image: [
          "https://images.unsplash.com/photo-1507089947368-19c1da9775ae"
        ],
        beds: 2,
        baths: 2,
        sqft: 650,
        type: "Apartment",
        availability: "For Sale",
        description: "Modern 2 BHK apartment in Angol with all amenities, close to schools and markets.",
        amenities: ["Lift", "Parking", "24/7 Security"],
        phone: "+91-900-000-1001",
        seeded: true,
      },
      {
        title: "Veetrag Ruby Pride",
        location: "SBI Colony, Belagavi",
        price: 6800000,
        image: [
          "https://housing-images.n7net.in/4f2250e8/b22fb0a88c30714b7d9b59eee16c5486/v0/large/fortune_tower-sbi_colony_belgaum-belgaum-the_fortune_five.jpeg"
        ],
        beds: 2,
        baths: 2,
        sqft: 900,
        type: "Apartment",
        availability: "For Sale",
        description: "Spacious 2 BHK flat in a prime area, with modern amenities and good connectivity.",
        amenities: ["Gym", "Parking", "Children's Play Area"],
        phone: "+91-900-000-1002",
        seeded: true,
      },
      {
        title: "Amogh Golden Pearl",
        location: "Piranwadi, Belagavi",
        price: 3800000,
        image: [
          "https://amoghbuilders.in/assets/img/slider/clubhouse.jpg"
        ],
        beds: 2,
        baths: 2,
        sqft: 800,
        type: "Apartment",
        availability: "For Sale",
        description: "Affordable 2 BHK apartment in Piranwadi, ideal for families.",
        amenities: ["Parking", "Lift", "24/7 Security"],
        phone: "+91-900-000-1003",
        seeded: true,
      },
      {
        title: "Noorani Corbel One City Homes",
        location: "Shahapur, Belagavi",
        price: 5200000,
        image: [
          "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd"
        ],
        beds: 3,
        baths: 2,
        sqft: 1100,
        type: "Apartment",
        availability: "For Sale",
        description: "Ready-to-move 3 BHK in Shahapur, with excellent ventilation and amenities.",
        amenities: ["Lift", "Parking", "Power Backup"],
        phone: "+91-900-000-1004",
        seeded: true,
      },
      {
        title: "Veerbhadrappa Vaishnavii Residency I",
        location: "Sadashiv Nagar, Belagavi",
        price: 3500000,
        image: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
        ],
        beds: 2,
        baths: 2,
        sqft: 700,
        type: "Apartment",
        availability: "For Sale",
        description: "2 BHK flat in Sadashiv Nagar, close to the Bangalore-Mumbai Economic Corridor.",
        amenities: ["Parking", "Lift"],
        phone: "+91-900-000-1005",
        seeded: true,
      },
      {
        title: "Fortune Tower",
        location: "SBI Colony, Belagavi",
        price: 7200000,
        image: [
          "https://images.unsplash.com/photo-1565182999561-18d7dc61c393"
        ],
        beds: 3,
        baths: 3,
        sqft: 1200,
        type: "Apartment",
        availability: "For Sale",
        description: "Premium 3 BHK apartment in Fortune Tower, SBI Colony.",
        amenities: ["Gym", "Club House", "Parking"],
        phone: "+91-900-000-1006",
        seeded: true,
      },
      {
        title: "Guru Krupa Nilaya",
        location: "Anjaneya Nagar, Belagavi",
        price: 4600000,
        image: [
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
        ],
        beds: 2,
        baths: 2,
        sqft: 1100,
        type: "Apartment",
        availability: "For Sale",
        description: "2 BHK ready-to-move flat in Anjaneya Nagar, with modern amenities.",
        amenities: ["Parking", "Lift", "24/7 Security"],
        phone: "+91-900-000-1007",
        seeded: true,
      },
      {
        title: "Lotus Pinnacle",
        location: "Mandoli, Belagavi",
        price: 6400000,
        image: [
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"
        ],
        beds: 2,
        baths: 2,
        sqft: 1200,
        type: "Apartment",
        availability: "For Sale",
        description: "Spacious 2 BHK in Mandoli, with all modern facilities.",
        amenities: ["Gym", "Parking", "Children's Play Area"],
        phone: "+91-900-000-1008",
        seeded: true,
      },
      {
        title: "Noorani The Strand",
        location: "Sadashiv Nagar, Belagavi",
        price: 10200000,
        image: [
          "https://images.unsplash.com/photo-1600573472550-8090b5e0745e"
        ],
        beds: 3,
        baths: 3,
        sqft: 1942,
        type: "Apartment",
        availability: "For Sale",
        description: "Luxury 3 BHK apartment in Sadashiv Nagar, Noorani The Strand.",
        amenities: ["Gym", "Club House", "Parking", "Swimming Pool"],
        phone: "+91-900-000-1009",
        seeded: true,
      },
      {
        title: "Windmills By Your Side By Swarna Griha",
        location: "Kakati, Belagavi",
        price: 3900000,
        image: [
          "https://teja10.kuikr.com//r1/20220910/ak_976_1589271757-1662803171_700x700.png"
        ],
        beds: 2,
        baths: 2,
        sqft: 900,
        type: "Apartment",
        availability: "For Sale",
        description: "2 BHK apartment in Kakati, ready to move, with all amenities.",
        amenities: ["Parking", "Lift", "24/7 Security"],
        phone: "+91-900-000-1010",
        seeded: true,
      },
    ].map(p => ({ ...p, seeded: true }));

    await Property.insertMany(properties);
    console.log("✅ Seed data inserted successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedProperties();
