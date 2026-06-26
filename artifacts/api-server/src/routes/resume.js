import { Router } from "express";
import multer from "multer";
import { createRequire } from "module";
import { logger } from "../lib/logger.js";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are accepted"));
    }
  },
});

export const resumeRouter = Router();

resumeRouter.post("/parse-resume", upload.single("resume"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    logger.info({ fileName: req.file.originalname }, "Parsing resume PDF");

    const data = await pdfParse(req.file.buffer);

    res.json({
      text: data.text,
      numpages: data.numpages,
      fileName: req.file.originalname,
    });
  } catch (err) {
    next(err);
  }
});
