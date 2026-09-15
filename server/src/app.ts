import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma.js";
import contentRoutes from "./routes/content.routes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "GetToThePoint API is running"
  });
});


app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});

app.use("/api/content", contentRoutes)

export default app;