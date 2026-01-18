import express from "express";
import donorRoutes from "./routes/donorUser.routes";
import organizationRoutes from "./routes/organizationUser.routes";
import { connectDatabase } from "./database/mongodb";
import dotenv from "dotenv";

const app = express();
dotenv.config(); // Load .env

app.use(express.json());

connectDatabase();

app.use("/api/v1/donorusers", donorRoutes);
app.use("/api/v1/organizations", organizationRoutes);

app.get("/", (_req, res) => {
  res.send("Raktosewa API is running ");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
