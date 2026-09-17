import { Router } from "express";
import { chatController } from "../controllers/chat.controller.js";

const router = Router();

router.post(
  "/content/:contentId/chat",
  chatController,
);

export default router;