import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma.js";
import contentRoutes from "./routes/content.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { clerkMiddleware } from "@clerk/express";
import { authMiddleware } from "./middleware/auth.middleware.js";


const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
  }),
);

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

app.use(clerkMiddleware())

app.use("/api/content", authMiddleware, contentRoutes);
app.use("/api", authMiddleware, chatRoutes);
app.use(errorMiddleware);

export default app;