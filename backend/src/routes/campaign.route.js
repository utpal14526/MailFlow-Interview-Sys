import { Router } from "express";
import {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaignById,
  deleteCampaignById,
  getDashBoardData,
  startSendCampaign,
  createAndSendCampaignBySheet,
} from "../controllers/campaign.controller.js";
import multer from "multer";
import * as XLSX from "xlsx";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();
const upload = multer({ dest: "uploads/" });

/**
 * @swagger
 * tags:
 *   name: Campaigns
 *   description: Campaign management and sending API
 */

/**
 * @swagger
 * /campaign/send/{campaignId}:
 *   post:
 *     summary: Start sending a campaign
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaign sending started
 */
router.post("/send/:campaignId", authenticate, startSendCampaign);

/**
 * @swagger
 * /campaign/getDashBoardData:
 *   get:
 *     summary: Get dashboard statistics for campaigns
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalCampaignsCount:
 *                       type: integer
 *                       example: 9
 *                     sentCampaignsCount:
 *                       type: integer
 *                       example: 5
 *                     draftCampaignsCount:
 *                       type: integer
 *                       example: 1
 *                     failedCampaignsCount:
 *                       type: integer
 *                       example: 3
 *                     inProgressCampaignsCount:
 *                       type: integer
 *                       example: 0
 *                     totalContacts:
 *                       type: integer
 *                       example: 3
 */
router.get("/getDashBoardData", authenticate, getDashBoardData);

/**
 * @swagger
 * /campaign:
 *   post:
 *     summary: Create a new campaign
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - body
 *               - taggedContacts
 *               - name
 *             properties:
 *               subject:
 *                 type: string
 *                 example: "Welcome Email"
 *               body:
 *                 type: string
 *                 example: "Hello, welcome to MailFlow!"
 *               taggedContacts:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "689aec01ca86deaa1530da43"
 *               name:
 *                 type: string
 *                 example: "Onboarding Campaign"
 *     responses:
 *       200:
 *         description: Campaign successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Campaign'
 */
router.post("/", authenticate, createCampaign);

/**
 * @swagger
 * /campaign:
 *   get:
 *     summary: Get all campaigns (filterable by status)
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [sent, draft, failed, in-progress]
 *         description: Filter campaigns by status
 *     responses:
 *       200:
 *         description: List of campaigns
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 campaigns:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Campaign'
 */
router.get("/", authenticate, getAllCampaigns);

/**
 * @swagger
 * /campaign/{campaignId}:
 *   get:
 *     summary: Get a campaign by ID
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *         description: Campaign ID
 *     responses:
 *       200:
 *         description: Campaign details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Campaign'
 */
router.get("/:campaignId", authenticate, getCampaignById);

/**
 * @swagger
 * /campaign/{campaignId}:
 *   patch:
 *     summary: Update a campaign (only if status is draft)
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *                 example: "Updated Subject"
 *               body:
 *                 type: string
 *                 example: "Updated body text"
 *               name:
 *                 type: string
 *                 example: "Updated Campaign Name"
 *     responses:
 *       200:
 *         description: Campaign updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Campaign'
 */
router.patch("/:campaignId", authenticate, updateCampaignById);

/**
 * @swagger
 * /campaign/{campaignId}:
 *   delete:
 *     summary: Delete a campaign (only if status is draft)
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaign deleted
 */
router.delete("/:campaignId", authenticate, deleteCampaignById);

router.post(
  "/send/campaign/upload-sheet",
  upload.single("file"),
  createAndSendCampaignBySheet
);

export default router;
