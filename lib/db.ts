import mongoose from "mongoose";

// Cache connection across hot-reloads in development
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache;
}

const cached: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cached;

async function connectDB(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("Please define MONGODB_URI in .env.local");
  }
  if (MONGODB_URI.includes("<username>") || MONGODB_URI.includes("<password>")) {
    throw new Error(
      "MONGODB_URI still contains placeholder values. Replace <username> and <password> with your real Atlas credentials."
    );
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    console.log("[DB] Connecting to MongoDB...");
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((m) => {
        console.log("[DB] ✅ Connected to MongoDB successfully");
        return m;
      })
      .catch((err) => {
        console.error("[DB] ❌ Connection failed:", err.message);
        cached.promise = null; // allow retry
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
