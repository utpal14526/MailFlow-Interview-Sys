import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import dbConnection from "./common/config/database-connection.js";
import campaignRoutes from "./routes/campaign.route.js";
import aiRoutes from "./routes/ai.routes.js";

dotenv.config();

const app = express();
dbConnection();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/campaign", campaignRoutes);
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Protected route feature -- Implemented
// Mail send feature like gmail   -- Implemented
// Campaign email sending (new status)
// LogIn prr click se go to Start of login
// Updation in existing campaign
// while selecting campaigns , select all emails option -- Implemented
