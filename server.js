import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./src/config/db.js";
import verifiedNewsRouter from "./src/routers/verified_news.router.js";
import chalk from "chalk";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Colors for console
const colors = {
  success: chalk.hex('#10b981'),
  info: chalk.hex('#3b82f6'),
  warning: chalk.hex('#f59e0b'),
};

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// API Routes
app.use("/api/news", verifiedNewsRouter);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(colors.warning("Error:"), err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {}
  });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log();
  console.log(colors.success("╔════════════════════════════════════════╗"));
  console.log(colors.success("║   🚀 SERVER STARTED SUCCESSFULLY 🚀   ║"));
  console.log(colors.success("╚════════════════════════════════════════╝"));
  console.log();
  console.log(colors.info(`📍 Server Address: http://localhost:${PORT}`));
  console.log(colors.info(`📡 API Base URL: http://localhost:${PORT}/api`));
  console.log(colors.info(`❤️  Health Check: http://localhost:${PORT}/health`));
  console.log();
  console.log(colors.warning("💡 Available Endpoints:"));
  console.log(colors.warning("   • GET    /api/news              - Get all news"));
  console.log(colors.warning("   • GET    /api/news/:id          - Get single news"));
  console.log(colors.warning("   • POST   /api/news/check        - Check news with AI"));
  console.log(colors.warning("   • POST   /api/news              - Create news manually"));
  console.log(colors.warning("   • PUT    /api/news/:id          - Update news"));
  console.log(colors.warning("   • DELETE /api/news/:id          - Delete news"));
  console.log(colors.warning("   • GET    /api/news/stats/all    - Get statistics"));
  console.log(colors.warning("   • GET    /api/news/search/:keyword - Search news"));
  console.log();
});

export default app;