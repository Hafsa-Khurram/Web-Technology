const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const { clientUrl } = require("./config");
const { notFound, errorHandler } = require("./utils/http");

const app = express();

app.use(
  cors({
    origin: [clientUrl, "http://localhost:5173", "http://127.0.0.1:5173"],
  })
);
app.use(express.json({ limit: "1mb" }));
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/packages", require("./routes/packages"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/feedback", require("./routes/feedback"));
app.use("/api/users", require("./routes/users"));
app.use("/api", require("./routes/misc"));
app.use("/api", notFound);

// In production, serve the built React app from the same server
const clientDist = path.join(__dirname, "..", "..", "client", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => res.sendFile(path.join(clientDist, "index.html")));
}

app.use(errorHandler);

module.exports = app;
