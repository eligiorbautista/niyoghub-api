import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

export const sendEmail = async (to, subject, text) => {
  try {
    console.log("EMAIL_USER:", EMAIL_USER);
    console.log("EMAIL_PASSWORD:", EMAIL_PASSWORD);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"NiyogHub" <${EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
