import {
  createCampaignService,
  getAllCampaignsService,
  getCampaignByIdService,
  updateCampaignByIdService,
  deleteCampaignByIdService,
  getDashBoardDataService,
  startSendCampaignService,
} from "../services/campaign.service.js";
export const createCampaign = async (req, res) => {
  try {
    const { subject, body, taggedContacts, name } = req.body;

    const data = await createCampaignService(
      subject,
      body,
      taggedContacts,
      name,
      req.user._id
    );
    res.status(200).json({
      success: true,
      message: "Campaign successfully Created",
      campaign: data,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      success: false,
      message: "Campaign Not Created",
    });
  }
};

export const getAllCampaigns = async (req, res) => {
  try {
    let { status } = req.query;
    if (!status) {
      status = "sent";
    }
    const campaigns = await getAllCampaignsService(req.user._id, status);
    res.status(200).json({
      campaigns,
      success: true,
      message: "Campaigns Fetched successful",
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      success: false,
      message: "Campaign Fetching Failed",
    });
  }
};

export const getCampaignById = async (req, res) => {
  try {
    const campaignId = req.params.campaignId;
    const campaign = await getCampaignByIdService(req.user._id, campaignId);
    res.status(201).json({
      campaign,
      success: true,
      message: "Campaigns Fetched successful",
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      success: false,
      message: "Campaign Fetching Failed",
    });
  }
};

export const updateCampaignById = async (req, res) => {
  try {
    const campaignId = req.params.campaignId;
    const updatedFields = req.body;

    const updatedCampaign = await updateCampaignByIdService(
      req.user._id,
      campaignId,
      updatedFields
    );
    res.status(201).json({
      campaign: updatedCampaign,
      success: true,
      message: "Campaigns Updated successful",
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      success: false,
      message: "Campaign Updation Failed",
    });
  }
};

export const deleteCampaignById = async (req, res) => {
  try {
    const campaignId = req.params.campaignId;
    const result = await deleteCampaignByIdService(req.user._id, campaignId);
    if (!result) {
      return res.status(404).json({
        message: "Campaign not found",
        success: false,
        error: "Campaign not found",
      });
    }
    res.status(200).json({ message: "Campaign deleted", success: true });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      success: false,
      message: "Error deleting campaign",
    });
  }
};

export const getDashBoardData = async (req, res) => {
  try {
    const stats = await getDashBoardDataService(req.user._id);
    res.status(200).json({
      stats,
      success: true,
      message: "Dashboard Data Fetched successfully",
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      success: false,
      message: "Dashboard Data Fetching Failed",
    });
  }
};

export const startSendCampaign = async (req, res) => {
  try {
    await startSendCampaignService(req.user._id, req.params.campaignId);
    res.status(200).json({
      message: "Campaign started successfully",
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      success: false,
      message: "Error starting campaign",
    });
  }
};
