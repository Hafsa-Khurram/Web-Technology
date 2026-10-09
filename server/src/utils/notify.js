const nodemailer = require("nodemailer");
const { smtp } = require("../config");
const Notification = require("../models/Notification");

let transporter = null;
if (smtp.host && smtp.user) {
  transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: { user: smtp.user, pass: smtp.pass },
  });
}

/**
 * Sends an in-app notification and (if SMTP is configured) an email.
 * Failures to send email never break the request.
 */
async function notify(user, { title, message, link = "" }) {
  await Notification.create({ user: user._id, title, message, link });

  if (!user.email) return;
  if (!transporter) {
    console.log(`[email -> ${user.email}] ${title}: ${message}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: smtp.from,
      to: user.email,
      subject: `GoTravel: ${title}`,
      text: `Hi ${user.name},\n\n${message}\n\nThe GoTravel Team`,
      html: `<div style="font-family:Arial,sans-serif;max-width:520px">
        <h2 style="color:#0f4c5c">${title}</h2>
        <p>Hi ${user.name},</p><p>${message}</p>
        <p style="color:#888">The GoTravel Team</p></div>`,
    });
  } catch (err) {
    console.warn("Email could not be sent:", err.message);
  }
}

module.exports = { notify };
