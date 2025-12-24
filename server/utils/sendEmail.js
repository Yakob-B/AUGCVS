const nodemailer = require('nodemailer');
const logger = require('./logger');

const sendEmail = async (options) => {
    // Create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        },
        // Force IPv4 to avoid IPv6 issues on some cloud providers
        family: 4,
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000
    });

    logger.info(`Attempting to send email using host: ${process.env.SMTP_HOST}, port: ${process.env.SMTP_PORT}, secure: ${process.env.SMTP_PORT == 465}`);

    // Define email options
    const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || options.message // Support HTML emails
    };

    // Send email
    try {
        const info = await transporter.sendMail(message);
        logger.info(`Message sent: ${info.messageId}`);
        return info;
    } catch (error) {
        logger.error(`Email sending failed: ${error.message} - ${JSON.stringify(error)}`);
        throw error;
    }
};

module.exports = sendEmail;