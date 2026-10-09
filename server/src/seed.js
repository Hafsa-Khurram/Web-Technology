/**
 * Seeds the database with demo users, packages, coupons, bookings and reviews.
 * Run with:  npm run seed   (WARNING: clears existing data)
 */
const mongoose = require("mongoose");
const { mongoUri } = require("./config");
const User = require("./models/User");
const Package = require("./models/Package");
const Booking = require("./models/Booking");
const Feedback = require("./models/Feedback");
const Coupon = require("./models/Coupon");
const Notification = require("./models/Notification");

const packages = [
  {
    title: "Santorini Sunset Escape",
    destination: "Santorini",
    country: "Greece",
    category: "Luxury",
    price: 1450,
    durationDays: 6,
    seats: 16,
    image: "/images/country-1.jpg",
    description:
      "Whitewashed villages, blue domes and the most famous sunset in the Aegean. Stay in a cliffside suite in Oia, sail around the caldera and taste volcanic wines on a private tour.",
    highlights: ["Caldera-view suite in Oia", "Catamaran cruise with dinner", "Volcanic wine tasting", "Airport transfers included"],
  },
  {
    title: "Venice Canals & Romance",
    destination: "Venice",
    country: "Italy",
    category: "Culture",
    price: 1180,
    durationDays: 5,
    seats: 20,
    image: "/images/country-2.jpg",
    description:
      "Glide through centuries-old canals, wander St. Mark's Square at dawn and discover the glass-blowing island of Murano. A slow, beautiful journey through the floating city.",
    highlights: ["Private gondola ride", "Doge's Palace guided tour", "Murano & Burano day trip", "Boutique hotel near Rialto"],
  },
  {
    title: "Hunza Valley Autumn Trail",
    destination: "Hunza",
    country: "Pakistan",
    category: "Nature",
    price: 540,
    durationDays: 7,
    seats: 24,
    image: "/images/5.jpg",
    description:
      "Golden poplars, apricot orchards and the giants of the Karakoram. Drive the Karakoram Highway, visit Baltit and Altit forts and watch sunrise over Rakaposhi.",
    highlights: ["Karakoram Highway road trip", "Attabad Lake boating", "Baltit & Altit forts", "Local Hunza cuisine evenings"],
  },
  {
    title: "Thai Islands Hopper",
    destination: "Phi Phi & Krabi",
    country: "Thailand",
    category: "Beach",
    price: 890,
    durationDays: 8,
    seats: 22,
    image: "/images/country-6.jpg",
    description:
      "Limestone cliffs, turquoise lagoons and powder-soft beaches. Hop between Phuket, Phi Phi and Krabi with snorkelling, kayaking and long-tail boat trips.",
    highlights: ["Maya Bay & Pileh Lagoon", "Snorkelling day trip", "Railay beach kayaking", "Beachfront resorts"],
  },
  {
    title: "Maldives Overwater Retreat",
    destination: "North Malé Atoll",
    country: "Maldives",
    category: "Luxury",
    price: 2650,
    durationDays: 5,
    seats: 10,
    image: "/images/bg-2.jpg",
    description:
      "Wake up above a crystal lagoon in your own overwater villa. Snorkel with manta rays, enjoy a sandbank picnic and dine under the stars.",
    highlights: ["Overwater villa with pool", "All-inclusive dining", "Seaplane transfer", "Sunset dolphin cruise"],
  },
  {
    title: "Banff Lakes Adventure",
    destination: "Banff",
    country: "Canada",
    category: "Adventure",
    price: 1320,
    durationDays: 7,
    seats: 18,
    image: "/images/1.jpg",
    description:
      "Emerald lakes, glacier-carved peaks and wildlife at every turn. Hike to teahouses above Lake Louise, canoe Moraine Lake and soak in the hot springs.",
    highlights: ["Lake Louise & Moraine Lake", "Guided alpine hikes", "Banff Gondola", "Upper Hot Springs"],
  },
  {
    title: "Cappadocia Balloon Journey",
    destination: "Cappadocia",
    country: "Turkey",
    category: "Adventure",
    price: 760,
    durationDays: 4,
    seats: 20,
    image: "/images/01.jpg",
    description:
      "Float over fairy chimneys at sunrise in a hot-air balloon, sleep in a cave hotel and explore underground cities carved thousands of years ago.",
    highlights: ["Sunrise hot-air balloon flight", "Cave hotel stay", "Derinkuyu underground city", "Göreme open-air museum"],
  },
  {
    title: "Zakynthos Shipwreck Coast",
    destination: "Zakynthos",
    country: "Greece",
    category: "Beach",
    price: 980,
    durationDays: 6,
    seats: 20,
    image: "/images/country-4.jpg",
    description:
      "See the iconic Navagio shipwreck beach from the clifftop and by boat, swim in the Blue Caves and relax on the island's golden southern beaches.",
    highlights: ["Navagio boat tour", "Blue Caves swim", "Turtle-spotting cruise", "Seaside villa"],
  },
  {
    title: "San Francisco City Lights",
    destination: "San Francisco",
    country: "USA",
    category: "City",
    price: 1240,
    durationDays: 5,
    seats: 25,
    image: "/images/Scene.jpg",
    description:
      "Cable cars, the Golden Gate and world-class food. Cycle across the bridge, tour Alcatraz and spend a day in Napa wine country.",
    highlights: ["Golden Gate bike tour", "Alcatraz island visit", "Napa Valley day trip", "Downtown hotel"],
  },
  {
    title: "Lisbon Old Town Discovery",
    destination: "Lisbon",
    country: "Portugal",
    category: "City",
    price: 820,
    durationDays: 5,
    seats: 20,
    image: "/images/10.jpg",
    description:
      "Terracotta rooftops, yellow trams and fado nights. Explore Alfama and Belém, take a day trip to fairytale Sintra and taste the original pastéis de nata.",
    highlights: ["Tram 28 & Alfama walk", "Sintra palaces day trip", "Fado dinner show", "Belém pastry tasting"],
  },
  {
    title: "Bali Sunset Retreat",
    destination: "Ubud & Uluwatu",
    country: "Indonesia",
    category: "Nature",
    price: 960,
    durationDays: 7,
    seats: 20,
    image: "/images/bg-1.jpg",
    description:
      "Rice terraces, jungle temples and cliff-top sunsets. Split your time between peaceful Ubud and the beaches of Uluwatu with yoga, spa and a sunrise volcano trek.",
    highlights: ["Tegallalang rice terraces", "Mount Batur sunrise trek", "Uluwatu temple & Kecak dance", "Balinese spa day"],
  },
  {
    title: "Salt Flats Mirror Expedition",
    destination: "Salar de Uyuni",
    country: "Bolivia",
    category: "Adventure",
    price: 1390,
    durationDays: 6,
    seats: 12,
    image: "/images/pexels-emrecan-2079228.jpg",
    description:
      "Walk on the world's largest mirror. Cross the salt flats by 4x4, stay in a salt hotel and see flamingo lagoons and geysers high in the Andes.",
    highlights: ["4x4 salt flat expedition", "Salt hotel night", "Colourful lagoons", "Stargazing session"],
  },
];

const reviewsText = [
  "Absolutely magical trip. Everything was organised perfectly and the guide was wonderful.",
  "Worth every rupee. The hotels were beautiful and the itinerary was well paced.",
  "Booking was so easy and the agent kept us updated the whole time. Would travel again!",
  "Stunning views and great food. One of the best holidays our family has had.",
  "Good value and very friendly staff. A couple of long drives but the scenery made up for it.",
  "Loved every moment. Already planning the next trip with GoTravel.",
];

function daysFromNow(n) {
  const d = new Date();
  d.setHours(10, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
}

async function seed() {
  await mongoose.connect(mongoUri);
  console.log("Connected. Clearing old data...");
  await Promise.all([
    User.deleteMany({}),
    Package.deleteMany({}),
    Booking.deleteMany({}),
    Feedback.deleteMany({}),
    Coupon.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const admin = await User.create({ name: "Admin", email: "admin@gotravel.com", password: "admin123", role: "admin", phone: "+92 300 0000000" });
  const agent = await User.create({ name: "Zainab Asif", email: "agent@gotravel.com", password: "agent123", role: "agent", phone: "+92 300 1111111" });
  const customerData = [
    ["Hafsa Khurram", "customer@gotravel.com"],
    ["Ali Raza", "ali@example.com"],
    ["Ayesha Malik", "ayesha@example.com"],
    ["Usman Tariq", "usman@example.com"],
    ["Fatima Noor", "fatima@example.com"],
  ];
  const customers = [];
  for (const [name, email] of customerData) {
    customers.push(await User.create({ name, email, password: "customer123", role: "customer", phone: "+92 311 2223334" }));
  }

  const pkgs = await Package.insertMany(packages.map((p) => ({ ...p, createdBy: agent._id })));

  await Coupon.insertMany([
    { code: "WELCOME10", percent: 10, description: "10% off your first trip" },
    { code: "SUMMER20", percent: 20, description: "Summer sale - 20% off" },
  ]);

  // Demo bookings spread over the last 6 months
  const plan = [
    // [customerIdx, pkgIdx, travellers, createdDaysAgo, travelDayOffset, status, paidRatio, discount]
    [0, 2, 2, 160, -120, "completed", 1, 0],
    [1, 0, 2, 150, -100, "completed", 1, 10],
    [2, 6, 3, 130, -90, "completed", 1, 0],
    [3, 3, 4, 110, -70, "completed", 1, 0],
    [4, 4, 2, 95, -50, "completed", 1, 20],
    [0, 9, 1, 80, -40, "completed", 1, 0],
    [1, 5, 2, 70, -30, "completed", 1, 0],
    [2, 1, 2, 55, -20, "cancelled", 0, 0],
    [3, 10, 2, 45, 20, "confirmed", 0.5, 0],
    [4, 7, 3, 35, 25, "confirmed", 1, 10],
    [0, 3, 2, 25, 30, "confirmed", 0.3, 0],
    [1, 11, 2, 15, 40, "pending", 0, 0],
    [2, 8, 1, 8, 45, "pending", 0, 0],
    [3, 2, 5, 4, 50, "confirmed", 0.4, 0],
    [4, 0, 2, 2, 60, "pending", 0, 0],
  ];

  let r = 0;
  for (const [ci, pi, n, ago, travelOffset, status, paid, disc] of plan) {
    const pkg = pkgs[pi];
    const created = daysFromNow(-ago);
    const b = new Booking({
      user: customers[ci]._id,
      package: pkg._id,
      travelers: n,
      travelDate: daysFromNow(travelOffset),
      contactPhone: customers[ci].phone,
      status,
      unitPrice: pkg.price,
      subtotal: 0,
      total: 0,
      discountPercent: disc,
      discountCode: disc ? (disc === 10 ? "WELCOME10" : "SUMMER20") : "",
      createdAt: created,
      updatedAt: created,
      cancelledAt: status === "cancelled" ? daysFromNow(-ago + 3) : undefined,
    });
    b.recalculate();
    if (paid > 0) {
      b.payments.push({
        amount: Math.round(b.total * paid * 100) / 100,
        method: ["card", "bank-transfer", "easypaisa", "cash"][r % 4],
        reference: `TXN${100230 + r}`,
        recordedBy: agent._id,
        date: daysFromNow(-ago + 1),
      });
      b.recalculate();
    }
    await b.save();

    if (status === "completed") {
      await Feedback.create({
        user: customers[ci]._id,
        package: pkg._id,
        booking: b._id,
        rating: r % 5 === 4 ? 4 : 5,
        comment: reviewsText[r % reviewsText.length],
        createdAt: daysFromNow(travelOffset + 3),
      });
      b.feedbackGiven = true;
      await b.save();
    }
    r++;
  }

  for (const p of pkgs) await Feedback.refreshPackageRating(p._id);

  await Notification.create({
    user: customers[0]._id,
    title: "Welcome to GoTravel",
    message: "Your account is ready. Use code WELCOME10 for 10% off your next trip!",
    link: "/packages",
  });

  console.log("\nSeed complete! Demo accounts:");
  console.log("  Admin    admin@gotravel.com     / admin123");
  console.log("  Agent    agent@gotravel.com     / agent123");
  console.log("  Customer customer@gotravel.com  / customer123");
  console.log("  Promo codes: WELCOME10, SUMMER20\n");
  void admin;
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error("Seed failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});
