import express from "express";
import { generateStats } from "../controllers/geminiController.js";

const router = express.Router();

router.post("/generate", generateStats);

export default router;
