import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendMail = async (options) => {
  // Configure mailgen by setting a theme and your product info
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      // Appears in header & footer of e-mails
      name: "MainProject",
      link: "MainProject.com",
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
  const option = {
    from: '"MainProject" <mainproject.email>"',
    to: options.email,
    subject: options.subject,
    text: emailText,
    html: emailBody,
  };
  await transporter.sendMail(option);
  console.log("Mail has been sent");
};

function emailVerificationMailgenContent(username, verifictionUrl) {
  return {
    body: {
      name: username,
      intro: "Welcome to MainProject We're very excited to have you on board.",
      action: {
        instructions: "To get started with MainProject, please click here:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Verify",
          link: verifictionUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
}

function forgotPasswordMailgenContent(username, forgotPasswordUrl) {
  return {
    body: {
      name: username,
      intro: "This Mail is from MainProject to reset your Password",
      action: {
        instructions: "To reset your password, please click here:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Reset",
          link: forgotPasswordUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
}

export {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendMail,
};
