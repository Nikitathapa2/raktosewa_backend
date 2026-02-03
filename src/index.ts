import express from "express";
import donorRoutes from "./routes/donorUser.routes";
import organizationRoutes from "./routes/organizationUser.routes";
import adminRoutes from "./routes/admin/user.route";
import authRoutes from "./routes/auth.routes";
import { connectDatabase } from "./database/mongodb";
import { seedAdminUser } from "./seeds/admin.seed";
import { seedTestUsers } from "./seeds/test-users.seed";
import dotenv from "dotenv";
import cors from "cors";

const app = express();
dotenv.config(); // Load .env
app.use(
  cors(),
);

app.use(express.json());
// Serve static files for uploaded assets
app.use("/public", express.static("public"));

connectDatabase();

/* ----------------------------------
   Seed Admin User on startup
   Creates default admin if not exists
----------------------------------- */
seedAdminUser().catch((error) => {
  console.error("Failed to seed admin user:", error);
  process.exit(1);
});

/* ----------------------------------
   Seed Test Users on startup
   Creates sample donor and organization users if they don't exist
----------------------------------- */
seedTestUsers().catch((error) => {
  console.error("Failed to seed test users:", error);
  // Don't exit on test user seed failure, it's optional
});

/* ----------------------------------
   User Routes (Donor & Organization)
----------------------------------- */
app.use("/api/v1/donorusers", donorRoutes);
app.use("/api/v1/organizations", organizationRoutes);

/* ----------------------------------
   Admin Routes (Protected by isAdmin middleware)
   All admin endpoints require admin role
----------------------------------- */
app.use("/api/admin/users", adminRoutes);

/* ----------------------------------
   Authentication & Profile Routes
   For logged-in users to manage their own profiles
----------------------------------- */
app.use("/api/auth", authRoutes);

app.get("/", (_req, res) => {
  res.send("Raktosewa API is running ");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
