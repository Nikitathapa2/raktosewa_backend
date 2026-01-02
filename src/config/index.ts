import dotenv from "dotenv";
dotenv.config();

// PORT with default fallback
export const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// MongoDB URI — REQUIRED, no localhost fallback
export const MONGODB_URI: string = process.env.MONGODB_URI || (() => {
    throw new Error("MONGODB_URI environment variable is not set!");
})();

// JWT Secret — REQUIRED, no default
export const JWT_SECRET: string = process.env.JWT_SECRET || (() => {
    throw new Error("JWT_SECRET environment variable is not set!");
})();
