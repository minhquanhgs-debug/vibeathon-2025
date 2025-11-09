const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Twilio client - only initialize if credentials are valid
let twilioClient;
try {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  
  // Only initialize if SID starts with 'AC' (valid Twilio Account SID format)
  if (twilioSid && twilioToken && twilioSid.startsWith('AC')) {
    twilioClient = twilio(twilioSid, twilioToken);
    console.log('✅ Twilio SMS service initialized');
  } else {
    console.log('⚠️  Twilio not configured - SMS notifications disabled');
  }
} catch (error) {
  console.log('⚠️  Twilio initialization failed - SMS notifications disabled');
}

/**
 * Send notification via email or SMS
 * @param {Object} options - Notification options
 * @param {string} options.type - 'email' or 'sms'
 * @param {string} options.to - Recipient email or phone
 * @param {string} options.subject - Email subject (for email type)
 * @param {string} options.message - Message content
 * @param {string} options.html - HTML content (for email type)
 */
exports.sendNotification = async (options) => {
  try {
    const { type, to, subject, message, html } = options;

    if (type === 'email') {
      await sendEmail({ to, subject, message, html });
    } else if (type === 'sms') {
      await sendSMS({ to, message });
    }

    console.log(`✉️  ${type.toUpperCase()} notification sent to: ${to}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Notification error:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Send email notification
 */
async function sendEmail({ to, subject, message, html }) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'ReferHarmony <noreply@referharmony.com>',
    to,
    subject,
    text: message,
    html: html || `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #007bff; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">ReferHarmony</h1>
          <p style="color: white; margin: 5px 0;">Bridging Care with Clarity and Precision</p>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <p style="color: #333; line-height: 1.6;">${message}</p>
        </div>
        <div style="background-color: #e9ecef; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>This is an automated message from ReferHarmony. Please do not reply to this email.</p>
        </div>
      </div>
    `
  };

  await emailTransporter.sendMail(mailOptions);
}

/**
 * Send SMS notification
 */
async function sendSMS({ to, message }) {
  if (!twilioClient) {
    throw new Error('Twilio client not configured');
  }

  await twilioClient.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to
  });
}

/**
 * Send referral status update notification
 */
exports.sendReferralStatusNotification = async (referral, newStatus) => {
  const patient = referral.patient;
  const provider = referral.receivingProvider;

  const statusMessages = {
    pending: 'Your referral has been created and is pending review.',
    acknowledged: 'Your referral has been acknowledged by the receiving provider.',
    scheduled: `Your appointment has been scheduled for ${referral.appointmentDate ? new Date(referral.appointmentDate).toLocaleDateString() : 'a future date'}.`,
    completed: 'Your referral appointment has been completed.',
    cancelled: 'Your referral has been cancelled.',
    rejected: 'Your referral has been rejected. Please contact your provider for more information.'
  };

  const message = statusMessages[newStatus] || 'Your referral status has been updated.';

  // Send to patient
  if (patient.notifications && patient.notifications.email) {
    await this.sendNotification({
      type: 'email',
      to: patient.email,
      subject: `Referral Update - ${referral.referralNumber}`,
      message: `Hello ${patient.firstName},\n\n${message}\n\nReferral Number: ${referral.referralNumber}\nProvider: ${provider.firstName} ${provider.lastName}\n\nYou can view more details by logging into your ReferHarmony account.`
    });
  }

  if (patient.notifications && patient.notifications.sms && patient.phone) {
    await this.sendNotification({
      type: 'sms',
      to: patient.phone,
      message: `ReferHarmony: ${message} Ref: ${referral.referralNumber}`
    });
  }
};

/**
 * Send appointment reminder
 */
exports.sendAppointmentReminder = async (referral, daysBefore = 1) => {
  const patient = referral.patient;
  const provider = referral.receivingProvider;
  const appointmentDate = new Date(referral.appointmentDate);

  const message = `Reminder: You have an appointment with ${provider.firstName} ${provider.lastName} on ${appointmentDate.toLocaleDateString()} at ${appointmentDate.toLocaleTimeString()}.`;

  if (patient.notifications && patient.notifications.email) {
    await this.sendNotification({
      type: 'email',
      to: patient.email,
      subject: `Appointment Reminder - ${referral.referralNumber}`,
      message: `Hello ${patient.firstName},\n\n${message}\n\nLocation: ${referral.appointmentLocation || 'TBD'}\n\nPlease arrive 15 minutes early for check-in.`
    });
  }

  if (patient.notifications && patient.notifications.sms && patient.phone) {
    await this.sendNotification({
      type: 'sms',
      to: patient.phone,
      message: `ReferHarmony: ${message} Location: ${referral.appointmentLocation || 'TBD'}`
    });
  }
};

/**
 * Send new message notification
 */
exports.sendNewMessageNotification = async (message, recipient) => {
  const sender = message.sender;

  if (recipient.notifications && recipient.notifications.email) {
    await this.sendNotification({
      type: 'email',
      to: recipient.email,
      subject: 'New Message in ReferHarmony',
      message: `You have received a new message from ${sender.firstName} ${sender.lastName}.\n\nLog in to ReferHarmony to view and respond.`
    });
  }
};

module.exports = exports;
