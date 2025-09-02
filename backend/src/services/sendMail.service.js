import { Campaign } from "../models/Campaign.js";
import nodemailer from "nodemailer";
import validator from "validator";
import { createMailTemplate } from "../utils/mail-template.js";
import { checkEmailExists } from "../utils/email-exists.js";
import dotenv from "dotenv";
import { User } from "../models/User.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.MAIL, pass: process.env.PASSWORD },
});

export const sendMailInBackground = async (ownerUserId, campaignId) => {
  try {
    console.log(`Sending campaign ${campaignId} for user ${ownerUserId}`);
    const campaign = await Campaign.findOne({
      _id: campaignId,
      owner: ownerUserId,
    }).populate("taggedContacts", "email");

    const recipients =
      campaign.uploadedEmails.length > 0
        ? campaign.uploadedEmails.map((c) => ({ email: c.email }))
        : campaign.taggedContacts;

    if (!recipients || recipients.length === 0) {
      await Campaign.findByIdAndUpdate(campaignId, {
        statusOfCampaign: "failed",
      });
      return;
    }

    let allSent = true;
    const sendLogs = [];

    for (const contact of campaign.taggedContacts) {
      try {
        if (!validator.isEmail(contact.email)) {
          allSent = false;
          console.log(`❌ Failed: ${contact.email} is invalid`);
          sendLogs.push({
            contact: contact._id,
            email: contact.email,
            status: "Failed ❌",
            reason: "Invalid email format",
          });
          continue;
        }

        if (!(await checkEmailExists(contact.email))) {
          allSent = false;
          console.log(`❌ Failed: ${contact.email} does not exist`);
          sendLogs.push({
            contact: contact._id,
            email: contact.email,
            status: "Failed ❌",
            reason: "Email does not exist",
          });
          continue;
        }

        console.log(`📧 Sending email to ${contact.email}`);
        await transporter.verify();
        await transporter.sendMail({
          from: process.env.MAIL,
          to: contact.email,
          subject: campaign.subject,
          html: createMailTemplate(campaign),
        });

        sendLogs.push({
          contact: contact._id,
          email: contact.email,
          status: "Success ✅",
          reason: "Sent successfully",
        });
      } catch (err) {
        allSent = false;
        console.error(`❌ Failed to send to ${contact.email}:`, err.message);
        sendLogs.push({
          contact: contact._id,
          email: contact.email,
          status: "Failed ❌",
          reason: err.message,
        });
      }
    }

    const user = await User.findById(ownerUserId);
    user.emailCredits -= campaign.taggedContacts.length;
    await user.save();

    await Campaign.findByIdAndUpdate(campaignId, {
      sendLogs,
      statusOfCampaign: allSent ? "sent" : "failed",
    });
  } catch (err) {
    console.error("Campaign send error:", err.message);
    await Campaign.findByIdAndUpdate(campaignId, {
      statusOfCampaign: "failed",
    });
  }
};
