import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} MailFlow. All rights reserved.</p>
      <p>Made By Utpal Raj</p>
    </footer>
  );
};

export default Footer;
