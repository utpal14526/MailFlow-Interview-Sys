import { Campaign } from "../models/Campaign.js";
import { getContactsCount } from "./contact.service.js";
import { User } from "../models/User.js";
import { sendMailInBackground } from "./sendMail.service.js";

export const createCampaignService = async (
  subject,
  body,
  taggedContacts,
  name,
  ownerId
) => {
  if (!subject || !body || !taggedContacts?.length || !name || !ownerId) {
    throw new Error("Name,Subject, body, and tagged contacts are required");
  }

  if (body.length < 10) {
    throw new Error("Body Too short");
  }

  const campaign = new Campaign({
    subject,
    body,
    taggedContacts,
    owner: ownerId,
    name,
    statusOfCampaign: "draft",
  });

  await campaign.save();
  return campaign;
};

export const getAllCampaignsService = async (ownerId, status) => {
  const filter = { owner: ownerId };
  if (status) filter.statusOfCampaign = status;

  const campaigns = await Campaign.find(filter)
    .populate("taggedContacts", "email")
    .sort({ createdAt: -1 });

  return campaigns;
};

export const getCampaignByIdService = async (ownerId, campaignId) => {
  const campaign = await Campaign.findOne({
    _id: campaignId,
    owner: ownerId,
  }).populate("taggedContacts", "email");
  if (!campaign) throw new Error("Campaign not found");
  return campaign;
};

export const updateCampaignByIdService = async (
  ownerId,
  campaignId,
  updateFields
) => {
  const { subject, body, taggedContacts, name } = updateFields;
  if (!subject || !body || !taggedContacts?.length || !name) {
    throw new Error("Name,Subject, body, and tagged contacts are required");
  }

  if (body.length < 10) {
    throw new Error("Body Too short");
  }
  const updated = await Campaign.findOneAndUpdate(
    { _id: campaignId, owner: ownerId },
    { $set: updateFields },
    { new: true }
  );

  if (!updated) throw new Error("Campaign not found or unauthorized");
  return updated;
};

export const deleteCampaignByIdService = async (ownerId, campaignId) => {
  const deleted = await Campaign.findOneAndDelete({
    _id: campaignId,
    owner: ownerId,
  });
  return deleted;
};

export const getDashBoardDataService = async (ownerId) => {
  const campaigns = await Campaign.find({ owner: ownerId }).populate(
    "taggedContacts",
    "email"
  );
  const totalCampaignsCount = campaigns.length;

  const draftCampaignsCount = campaigns.filter(
    (c) => c.statusOfCampaign === "draft"
  ).length;

  const inProgressCampaignsCount = campaigns.filter(
    (c) => c.statusOfCampaign === "in-progress"
  ).length;

  const failedCampaignsCount = campaigns.filter(
    (c) => c.statusOfCampaign === "failed"
  ).length;

  const sentCampaignsCount = campaigns.filter(
    (c) => c.statusOfCampaign === "sent"
  ).length;

  const totalContacts = await getContactsCount(ownerId);

  return {
    totalCampaignsCount,
    sentCampaignsCount,
    draftCampaignsCount,
    inProgressCampaignsCount,
    failedCampaignsCount,
    totalContacts,
  };
};

export const startSendCampaignService = async (ownerUserId, campaignId) => {
  const user = await User.findById(ownerUserId).select("-password");
  if (user.emailCredits <= 0) {
    throw new Error("Insufficient email credits!  Please Bug Email Credits");
  }

  const campaign = await Campaign.findOne({
    _id: campaignId,
    owner: ownerUserId,
  });

  if (!campaign || campaign.taggedContacts.length === 0) {
    await Campaign.findByIdAndUpdate(campaignId, {
      statusOfCampaign: "failed",
    });
    return;
  }

  if (campaign.taggedContacts.length > user.emailCredits) {
    throw new Error("Insufficient email credits! Please Bug Email Credits");
  }

  await Campaign.findOneAndUpdate(
    { _id: campaignId, owner: ownerUserId, statusOfCampaign: "draft" },
    { statusOfCampaign: "in-progress" }
  );

  sendMailInBackground(ownerUserId, campaign);
};
