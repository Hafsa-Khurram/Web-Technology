const mongoose = require("mongoose");
const { port, mongoUri } = require("./config");
const app = require("./app");

async function start() {
  try {
    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
  } catch (err) {
    console.error("\nCould not connect to MongoDB at", mongoUri);
    console.error("Make sure MongoDB is running (or set MONGO_URI in server/.env).\n", err.message);
    process.exit(1);
  }

  app.listen(port, () => console.log(`GoTravel API running on http://localhost:${port}`));
}

start();
