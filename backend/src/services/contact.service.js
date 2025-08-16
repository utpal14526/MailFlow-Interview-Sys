import { Contact } from "../models/Contact.js";
import { checkEmailExists } from "../utils/email-exists.js";

export const getContactsService = async (ownerUserId) => {
  return await Contact.find({ owner: ownerUserId }).sort({ createdAt: -1 });
};

export const addContactService = async (ownerUserId, name, email) => {
  if (!name || !email) {
    throw new Error("Name and Email is Required");
  }

  const data = await checkEmailExists(email);
  if (!data) {
    throw new Error("Email doesn't Exists");
  }
  const newContact = new Contact({
    owner: ownerUserId,
    name,
    email,
  });
  return await newContact.save();
};

export const deleteContactService = async (ownerUserId, contactId) => {
  return await Contact.findOneAndDelete({
    _id: contactId,
    owner: ownerUserId,
  });
};

export const getContactsCount = async (ownerUserId) => {
  return await Contact.countDocuments({ owner: ownerUserId });
};
