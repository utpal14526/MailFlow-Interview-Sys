import { Campaign } from "../models/Campaign.js";
import nodemailer from "nodemailer";
import validator from "validator";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.MAIL, pass: process.env.PASSWORD },
});

export const sendMailInBackground = async (ownerUserId, campaignId) => {
  try {
    const campaign = await Campaign.findOne({
      _id: campaignId,
      owner: ownerUserId,
    }).populate("taggedContacts", "email");

    if (!campaign || campaign.taggedContacts.length === 0) {
      await Campaign.findByIdAndUpdate(campaignId, {
        statusOfCampaign: "failed",
      });
      return;
    }

    let allSent = true;

    for (const contact of campaign.taggedContacts) {
      if (!validator.isEmail(contact.email)) {
        allSent = false;
        break;
      }
      try {
        await transporter.sendMail({
          from: process.env.MAIL,
          to: contact.email,
          subject: campaign.subject,
          html: campaign.body,
        });
      } catch (err) {
        allSent = false;
        console.error(`Failed to send to ${contact.email}:`, err.message);
      }
    }

    await Campaign.findByIdAndUpdate(campaignId, {
      statusOfCampaign: allSent ? "sent" : "failed",
    });
  } catch (err) {
    await Campaign.findByIdAndUpdate(campaignId, {
      statusOfCampaign: "failed",
    });
  }
};

// Some things i need to do in this project :
// In frontend make protected routes (not go to any page if user is not Logged In)
// Ai Integrate with mic that takes subject either by (mic or text) and generate body for you
// Forgot Password functionality
