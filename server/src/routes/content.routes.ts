import { Router } from "express";

import {
  createContentController,
  deleteContentController,
  getAllContentController,
  getContentByIdController,
  uploadContentController,
  youtubeContentController,
} from "../controllers/content.controller.js";

import { createContentSchema } from "../validators/content.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import { uploadMedia } from "../middleware/upload.middleware.js";

const router = Router();

router.post(
  "/",
  validate(createContentSchema),
  createContentController,
);

router.post(
  "/upload",
  uploadMedia.single("file"),
  uploadContentController,
);

router.post(
  "/youtube",
  youtubeContentController,
);

router.get("/", getAllContentController);

router.get("/:id", getContentByIdController);

router.delete("/:id", deleteContentController);

export default router;