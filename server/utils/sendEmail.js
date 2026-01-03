const nodemailer = require('nodemailer');
const logger = require('./logger');

const sendEmail = async (options) => {
    // Create transporter
    let transporterConfig = {
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
        family: 4, // Force IPv4
        connectionTimeout: 60000, // 60 seconds
        greetingTimeout: 60000,
        socketTimeout: 60000,
        debug: true, // Show debug output
        logger: true // Log information into console
    };

    const transporter = nodemailer.createTransport(transporterConfig);

    logger.info(`Attempting to send email using host: ${process.env.SMTP_HOST}, port: ${process.env.SMTP_PORT}, secure: ${process.env.SMTP_PORT == 465}`);

    // Define email options
    const fromName = process.env.FROM_NAME || 'AUGCVS System';
    const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;

    const message = {
        from: `"${fromName}" <${fromEmail}>`,
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