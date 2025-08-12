import { Router } from "express";
import {
  getAllContacts,
  addContact,
  deleteContact,
} from "../controllers/contact.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, getAllContacts);
router.post("/", authenticate, addContact);
router.delete("/:contactId", authenticate, deleteContact);

export default router;
