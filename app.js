require("dotenv").config(); // Load environment variables
const cors = require("cors");

const express = require("express");
const nodemailer = require("nodemailer");

const app = express();
const PORT = 3000;

// Middleware to parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Serve static files from the "public" directory
app.use(express.static("public"));

// POST route to handle form submission
app.post("/send-email", async (req, res) => {
    const { name, email, mob, message } = req.body;

    if (!name || !email || !mob || !message) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {

        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: email,
            to: process.env.EMAIL_USER,
            subject: "New Contact Form Submission",
            text: `Name: ${name}\nEmail: ${email}\nPhone: ${mob}\n\nMessage: ${message}`,
        };

        const info = await transporter.sendMail(mailOptions);
        res.status(200).json({ success: "Email sent successfully!" });

    } catch (error) {
        res.status(500).json({ error: "Could not send email. Try again later." });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
