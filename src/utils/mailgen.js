import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendMail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      // Appears in header & footer of e-mails
      name: "LMS",
      link: "https://LMS.com/",
      // Optional product logo
      // logo: 'https://mailgen.js/img/logo.png'
    },
  });

  // Generate an HTML email with the provided contents
  const emailBody = mailGenerator.generate(options.MailgenContent);

  // Generate the plaintext version of the e-mail (for clients that do not support HTML)
  const emailText = mailGenerator.generatePlaintext(options.MailgenContent);

  // Create a transporter using Ethereal test credentials.
  // For production, replace with your actual SMTP server details.
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // Use true for port 465, false for port 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  const options = {
    from: '"Learning management system" <lms.email>',
    to: options.user,
    subject: options.subject,
    text: emailText, // Plain-text version of the message
    html: emailBody, // HTML version of the message
  };

  await transporter.sendMail(options);
  console.log("mail has been sent!");
};
function emailVerificationMailContent(username, verificationUrl) {
  return {
    body: {
      name: username,
      intro: "Welcome to LMS,We're very excited to have you on board.",
      action: {
        instructions: "To get started with LMS, please click here:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Verify",
          link: verificationUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
}

function forgotPassowrdMailContent(username, forgotPasswordUrl) {
  return {
    body: {
      name: username,
      intro: "You recently requested to reset your password for your account.",
      action: {
        instructions: "Click the button below to reset your password:",
        button: {
          color: "#DC4D2F", // Red/orange is common for security actions
          text: "Reset your password",
          link: forgotPasswordUrl,
        },
      },
      outro: [
        "This password reset link will expire in 10 minutes.",
        "If you did not request a password reset, please ignore this email or contact support if you have concerns.",
      ],
    },
  };
}

export { emailVerificationMailContent, forgotPassowrdMailContent, sendMail };
