const path = require("path");
// Load .env từ thư mục gốc của project (3 cấp lên từ src/Components/API/utils/)
require("dotenv").config({ path: path.join(__dirname, "../../../../.env") });
const { Resend } = require("resend");

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(apiKey);
};

const getFromEmail = () => {
  const from = process.env.FROM_EMAIL?.trim();
  if (!from) {
    throw new Error("FROM_EMAIL is not configured");
  }
  return from;
};

const sendEmail = async ({ to, subject, html, text }) => {
  const resend = getResendClient();
  const from = getFromEmail();
  const toAddress = Array.isArray(to) ? to : [to];

  const payload = {
    from,
    to: toAddress,
    subject,
    html,
  };

  if (text) payload.text = text;

  const { error } = await resend.emails.send(payload);
  if (error) {
    throw new Error(error.message || "Failed to send email");
  }
};

module.exports = {
  sendEmail,
};
