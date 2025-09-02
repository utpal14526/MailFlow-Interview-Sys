import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/Payment.js";
import Plan from "../models/Plan.js";
import { User } from "../models/User.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.get("/plans", authenticate, async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true });
    res.status(200).json({
      plans,
      success: true,
      message: "Plans fetched successfully",
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch plans", success: false });
  }
});

router.post("/create-order", authenticate, async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user._id; // Get user ID from authenticated request

    console.log("Creating order for plan:", planId, "for user:", userId);

    const plan = await Plan.findById(planId);
    if (!plan)
      return res.status(404).json({
        error: "Plan not found",
        success: false,
        message: "Plan not found",
      });

    const options = {
      amount: plan.price * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    const payment = new Payment({
      userId,
      planId,
      razorpayOrderId: order.id,
      amount: plan.price,
      status: "created",
    });
    await payment.save();

    console.log("Order created:", order);

    res
      .status(200)
      .json({ orderId: order.id, amount: plan.price * 100, currency: "INR" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

router.post("/verify-payment", authenticate, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    console.log("Verifying payment for order:", razorpay_order_id);
    console.log("Payment ID:", razorpay_payment_id);
    console.log("Signature:", razorpay_signature);
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment details" });
    }
    const userId = req.user._id;
    console.log(userId);

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });
    if (!payment)
      return res.status(404).json({ error: "Payment record not found" });

    if (expectedSignature === razorpay_signature) {
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      payment.status = "paid";
      await payment.save();

      const plan = await Plan.findById(payment.planId);
      if (plan) {
        await User.findByIdAndUpdate(userId, {
          $inc: { emailCredits: plan.credits },
        });
      }

      return res.json({
        success: true,
        message: "Payment verified and credits added",
        payment,
      });
    } else {
      // Save failed attempt too
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          status: "failed",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        }
      );
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

export default router;
