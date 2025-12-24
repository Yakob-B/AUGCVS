const nodemailer = require('nodemailer');
const logger = require('./logger');

const sendEmail = async (options) => {
    // Create transporter
    let transporterConfig = {
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        family: 4, // Force IPv4
        connectionTimeout: 60000, // 60 seconds
        greetingTimeout: 60000,
        socketTimeout: 60000,
        debug: true, // Show debug output
        logger: true // Log information into console
    };

    // Use 'service: gmail' if the host is gmail, otherwise use manual host/port
    if (process.env.SMTP_HOST && process.env.SMTP_HOST.includes('gmail')) {
        transporterConfig.service = 'gmail';
    } else {
        transporterConfig.host = process.env.SMTP_HOST;
        transporterConfig.port = process.env.SMTP_PORT;
        transporterConfig.secure = process.env.SMTP_PORT == 465;
        transporterConfig.tls = { rejectUnauthorized: false };
    }

    const transporter = nodemailer.createTransport(transporterConfig);

    logger.info(`Attempting to send email via ${transporterConfig.service || process.env.SMTP_HOST}...`);

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