require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const companyRoutes = require("./routes/company");
const customersRoutes = require("./routes/customers");
const invoiceRoutes = require("./routes/invoices");
const paymentRoutes = require("./routes/payment");
const activityRoutes = require("./routes/activity");
const Settings = require("./models/Settings");

const app = express();

app.use(
  cors({
    origin: true, // Vite frontend
    credentials: true,
  }),
);

app.use(express.json());

// request log (dev)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// serve logos & assets
app.use("/assets", express.static(path.join(__dirname, "public", "assets")));

// connect database
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/PrimeCapital";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// api routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/company", companyRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/settings", require("./routes/settings"));

// test routes
app.get("/", (req, res) => {
  res.send("Prime Capital API working...");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
