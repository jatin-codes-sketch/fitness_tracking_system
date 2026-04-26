/**
 * VitalityHub — MongoDB Connection via Mongoose
 * Connects on startup; auto-reconnects on drop.
 */
import mongoose from "mongoose";
import { settings } from "./settings.js";

const MONGO_OPTIONS = {
  dbName:             settings.MONGO_DB,
  serverSelectionTimeoutMS: 5_000,
  socketTimeoutMS:    45_000,
  maxPoolSize:        10,
};

export async function connectDB() {
  try {
    await mongoose.connect(settings.MONGO_URI, MONGO_OPTIONS);
    console.log(`✅  MongoDB connected — db: "${settings.MONGO_DB}"`);
  } catch (err) {
    console.error("❌  MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

// Log connection events
mongoose.connection.on("disconnected", () =>
  console.warn("⚠️   MongoDB disconnected — will reconnect automatically")
);
mongoose.connection.on("reconnected", () =>
  console.log("✅  MongoDB reconnected")
);
mongoose.connection.on("error", (err) =>
  console.error("❌  MongoDB error:", err.message)
);

export default mongoose;