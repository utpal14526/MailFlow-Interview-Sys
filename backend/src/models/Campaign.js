import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    taggedContacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contact",
      },
    ],
    uploadedEmails: [
      {
        name: { type: String },
        email: { type: String, required: true },
      },
    ],
    statusOfCampaign: {
      type: String,
      enum: ["sent", "draft", "failed", "in-progress"],
      default: "draft",
    },
    name: {
      type: String,
    },
    sendLogs: [
      {
        contact: { type: mongoose.Schema.Types.ObjectId, ref: "Contact" },
        email: String,
        status: {
          type: String,
          enum: ["success", "failed", "in-progress"],
          default: "failed",
        },
        reason: String,
      },
    ],
  },
  { timestamps: true }
);

export const Campaign = mongoose.model("Campaign", campaignSchema);
