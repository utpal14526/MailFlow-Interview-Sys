import { Router } from "express";
import { aiSpeechToCampaign } from "../controllers/ai.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/analyzeSpeech", authenticate, aiSpeechToCampaign);

export default router;
