import multer from "multer";
import path from "node:path";

import { AppError } from "../errors/AppError.js";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/");
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

    cb(null, filename);
  },
});

const allowedMimeTypes = new Set([
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  cb,
) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    cb(new AppError("Unsupported file type", 400));
    return;
  }

  cb(null, true);
};

export const uploadMedia = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
  fileFilter,
});