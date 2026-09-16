import { Router } from "express";
import { createContentController, deleteContentController, getAllContentController, getContentByIdController } from "../controllers/content.controller.js";

const router = Router();

router.post("/", createContentController);
router.get("/", getAllContentController);
router.get("/:id", getContentByIdController);
router.delete("/:id", deleteContentController);

export default router;