import { aiSpeechToCampaignService } from "../services/ai.service.js";

export const aiSpeechToCampaign = async (req, res) => {
  try {
    const data = await aiSpeechToCampaignService(req, res);
    res.status(200).json({
      content: data,
      success: true,
      message: "Campaign Generated successful",
    });
  } catch (error) {
    res.status(401).json({
      error: error.message,
      success: false,
      message: " Campaign Generation failed",
    });
  }
};
