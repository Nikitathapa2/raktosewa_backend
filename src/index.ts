import express from "express";

import dotenv from "dotenv";

const app = express();
dotenv.config(); // Load .env

app.use(express.json());


app.get("/", (_req, res) => {
  res.send("Raktosewa API is running ");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
