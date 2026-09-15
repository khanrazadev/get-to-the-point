import { Router } from "express";
import { createContentController } from "../controllers/content.controller.js";

const router = Router();

router.post("/", createContentController);

export default router;