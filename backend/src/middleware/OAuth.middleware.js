import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const authenticateOAuth = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1] || req.query.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded._id);

    next();
  } catch (err) {
    console.log(err.message);
    res.status(401).json({ error: "Invalid token" });
  }
};
