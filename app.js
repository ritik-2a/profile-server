if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "./profile-server.env" });
}
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static("public"));

console.log("EMAIL_USER:", process.env.EMAIL_USER || "(not set)");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded" : "NOT LOADED");

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    emailConfigured: Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS),
  });
});

app.post("/send-email", async (req, res) => {
  const { name, email, mob, subject, message } = req.body;

  if (!name || !email || !mob || !message) {
    return res
      .status(400)
      .json({ error: "Name, email, phone and message are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Email credentials not configured on server.");
    return res.status(500).json({
      error: "Email service is not configured. Please contact the site owner.",
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailSubject =
      subject && subject.length
        ? `Portfolio Contact: ${subject}`
        : "New Contact Form Submission";

    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: mailSubject,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${mob}\nSubject: ${
        subject || "(none)"
      }\n\nMessage:\n${message}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    res.status(200).json({ success: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      error: "Could not send email. Try again later.",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
