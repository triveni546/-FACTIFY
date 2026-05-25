import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import predictRoutes from "./routes/predictRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

dotenv.config();

console.log("=== SERVER STARTING ===");
console.log("GEMINI_API_KEY loaded:", !!process.env.GEMINI_API_KEY);
console.log("Key starts with:", process.env.GEMINI_API_KEY?.slice(0, 10));
console.log("MONGO_URI loaded:", !!process.env.MONGO_URI);
console.log(
  "Email (contact/alerts) configured:",
  !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
);


const app = express();

app.set("trust proxy", 1);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/predict", predictRoutes);
app.use("/api/contact", contactRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Factify API is running...");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    message: err.message || "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});



