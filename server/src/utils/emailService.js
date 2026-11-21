import nodemailer from 'nodemailer';

const isSmtpConfigured = Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
);

let transporter = null;

if (isSmtpConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Sends a notification email to a citizen regarding complaint updates
 * @param {Object} options { to, subject, trackingId, status, remarks, citizenName }
 */
export const sendComplaintUpdateEmail = async ({ to, subject, trackingId, status, remarks, citizenName }) => {
  const emailSubject = subject || `[Police Portal] Complaint Update - ${trackingId} is now ${status}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <div style="background-color: #0b2545; color: white; padding: 15px; border-radius: 6px 6px 0 0; text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">Smart Police Complaint Management System</h2>
        <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.8;">Public Citizen Services Portal</p>
      </div>
      <div style="padding: 20px; background-color: #ffffff;">
        <p>Dear <strong>${citizenName || 'Citizen'}</strong>,</p>
        <p>Your registered complaint status has been officially updated in the system.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8fafc; border-radius: 6px;">
          <tr>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; width: 40%;">Complaint Tracking ID:</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; color: #1d4ed8; font-weight: bold;">${trackingId}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Updated Status:</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1;"><span style="background: #e0e7ff; color: #3730a3; padding: 3px 8px; border-radius: 4px; font-weight: 600;">${status}</span></td>
          </tr>
          ${remarks ? `
          <tr>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Official Remarks:</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1;">${remarks}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Date & Time:</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1;">${new Date().toLocaleString()}</td>
          </tr>
        </table>

        <p style="font-size: 14px; color: #475569;">
          You can track live progress and download updated acknowledgement slips anytime by visiting the citizen portal with your tracking ID.
        </p>

        <div style="margin-top: 30px; padding: 12px; background: #fef2f2; border-left: 4px solid #ef4444; font-size: 12px; color: #991b1b;">
          <strong>Notice:</strong> This email is an automated status notification. In case of emergency or immediate threat, please dial <strong>112</strong> immediately.
        </div>
      </div>
    </div>
  `;

  if (isSmtpConfigured && transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Smart Police Portal" <no-reply@policeportal.gov.in>',
        to,
        subject: emailSubject,
        html: htmlContent,
      });
      console.log(`[Email] Notification email successfully sent to ${to} for complaint ${trackingId}`);
      return true;
    } catch (err) {
      console.warn(`[Email] Failed to send email to ${to}: ${err.message}`);
      return false;
    }
  } else {
    console.log(`[Email Simulation] To: ${to} | Subject: ${emailSubject} | Status: ${status}`);
    return true;
  }
};
