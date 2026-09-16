import { Router } from "express";
import { createContentController, deleteContentController, getAllContentController, getContentByIdController } from "../controllers/content.controller.js";
import { createContentSchema } from "../validators/content.validator.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.post("/", validate(createContentSchema), createContentController);
router.get("/", getAllContentController);
router.get("/:id", getContentByIdController);
router.delete("/:id", deleteContentController);

export default router;