import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import config from "../config/env.js";
import logger from "../utils/logger.js";

// Create reusable, pooled transporter for high throughput
const createTransporter = () => {
    return nodemailer.createTransport({
        pool: true, // Reuse connections
        maxConnections: 5,
        maxMessages: 100,
        host: config.SMTP_HOST,
        port: parseInt(config.SMTP_PORT),
        secure: parseInt(config.SMTP_PORT) === 465,
        auth: {
            user: config.SMTP_USER,
            pass: config.SMTP_PASS,
        },
    });
};

// Mailgen instance
const mailgen = new Mailgen({
    theme: "default",
    product: {
        name: config.MAIL_NAME || "LearnHub",
        link: config.CLIENT_URL,
        logo: `${config.CLIENT_URL}/logo.png`,
    },
});


/**
 * Core send function with structured logging
 */
const sendMail = async ({ to, subject, mailgenContent }) => {
    if (!config.SMTP_USER || !config.SMTP_PASS) {
        logger.warn("[Email] SMTP credentials not configured. Email not sent.");
        return;
    }

    const transporter = createTransporter();
    const emailText = mailgen.generatePlaintext(mailgenContent);
    const emailHtml = mailgen.generate(mailgenContent);

    try {
        const info = await transporter.sendMail({
            from: `"${config.MAIL_NAME || "LearnHub"}" <${config.MAIL_FROM || config.SMTP_USER}>`,
            to,
            subject,
            text: emailText,
            html: emailHtml,
        });
        logger.info({ messageId: info.messageId, to }, "📧 Email sent successfully");
        return info;
    } catch (err) {
        logger.error({ err: err.message, to, subject }, "❌ Failed to send email");
        throw err; // Re-throw for BullMQ retry logic
    }
};


/**
 * Send email verification OTP
 */
export const sendVerificationEmail = async (user, otp) => {
    const mailgenContent = {
        body: {
            name: user.name,
            intro: "Welcome to LearnHub! Please verify your email address to get started.",
            dictionary: {
                "Verification Code": `**${otp}**`,
                "Expires In": "10 minutes",
            },
            action: {
                instructions: "Enter the code above on the verification page to complete your registration.",
                button: {
                    color: "#6366f1",
                    text: "Go to Dashboard",
                    link: `${config.CLIENT_URL}/dashboard`,
                },
            },
            outro: "If you did not create an account, please ignore this email.",
        },
    };


    await sendMail({
        to: user.email,
        subject: `${otp} is your LearnHub verification code`,
        mailgenContent,
    });

};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (user, resetUrl) => {
    const mailgenContent = {
        body: {
            name: user.name,
            intro: "You have received this email because a password reset request was received for your account.",
            action: {
                instructions: "Click the button below to reset your password. This link expires in 10 minutes.",
                button: {
                    color: "#ef4444",
                    text: "Reset Password",
                    link: resetUrl,
                },
            },
            outro: "If you did not request a password reset, no further action is required.",
        },
    };

    await sendMail({
        to: user.email,
        subject: "Password Reset — LearnHub",
        mailgenContent,
    });
};

/**
 * Send purchase receipt email
 */
export const sendPurchaseReceiptEmail = async (user, course, amount) => {
    const mailgenContent = {
        body: {
            name: user.name,
            intro: `Thank you for purchasing "${course.title}"!`,
            table: {
                data: [
                    { item: course.title, description: course.subtitle || "", amount: `₹${amount}` },
                ],
                columns: {
                    customWidth: { item: "20%", description: "60%", amount: "20%" },
                    customAlignment: { amount: "right" },
                },
            },
            action: {
                instructions: "You can start learning right away:",
                button: {
                    color: "#10b981",
                    text: "Start Learning",
                    link: `${config.CLIENT_URL}/course-progress/${course._id}`,
                },
            },
            outro: "Thank you for learning with LearnHub!",
        },
    };

    await sendMail({
        to: user.email,
        subject: `Purchase Confirmed: ${course.title} — LearnHub`,
        mailgenContent,
    });
};

/**
 * Send course completion email
 */
export const sendCourseCompletionEmail = async (user, course) => {
    const mailgenContent = {
        body: {
            name: user.name,
            intro: `🎉 Congratulations! You've completed "${course.title}"!`,
            action: {
                instructions: "Browse more courses to continue your learning journey:",
                button: {
                    color: "#6366f1",
                    text: "Browse Courses",
                    link: `${config.CLIENT_URL}/courses`,
                },
            },
            outro: "Keep learning — you're doing amazing!",
        },
    };

    await sendMail({
        to: user.email,
        subject: `Course Completed: ${course.title} — LearnHub 🎓`,
        mailgenContent,
    });
};

export { sendMail };
