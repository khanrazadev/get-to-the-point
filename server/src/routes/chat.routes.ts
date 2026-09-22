import { Router } from "express";

import {
  chatController,
  getChatSessionController,
} from "../controllers/chat.controller.js";

const router = Router();

router.get(
  "/content/:contentId/chat",
  getChatSessionController,
);

router.post(
  "/content/:contentId/chat",
  chatController,
);

export default router;