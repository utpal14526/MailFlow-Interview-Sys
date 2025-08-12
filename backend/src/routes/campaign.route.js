import { Router } from "express";
import {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaignById,
  deleteCampaignById,
  getDashBoardData,
  startSendCampaign,
} from "../controllers/campaign.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/send/:campaignId", authenticate, startSendCampaign);
router.get("/getDashBoardData", authenticate, getDashBoardData);
router.post("/", authenticate, createCampaign);
router.get("/", authenticate, getAllCampaigns);
router.get("/:campaignId", authenticate, getCampaignById);
router.patch("/:campaignId", authenticate, updateCampaignById);
router.delete("/:campaignId", authenticate, deleteCampaignById);

export default router;

// Create a campaign
// get all campaigns filter by status
// get a campaign by id
// update a campaign by id if in draft status
// delete a campaign by id if in draft status
