import express from "express";
import statsRoutes from "./routes/stats.js";

const server = express();

server.use("/stats", statsRoutes);

server.listen(3000, () => {
  console.log("API running on port 3000");
});