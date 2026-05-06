const { SMTP_CONFIG, BRAND_CONFIG } = require('./constants');
const nodemailer = require('nodemailer');

// ─── SMTP Transporter ──────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport(SMTP_CONFIG);

// ─── Brand Config ──────────────────────────────────────────────────────────────
const BRAND = BRAND_CONFIG;

// ─── Base Template Wrapper ─────────────────────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#F8FAFC; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8FAFC;padding:40px 10px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.04);border:1px solid #E2E8F0;">
          
          <!-- Modern Dark Header -->
          <tr>
            <td style="background-color:#0F172A;padding:48px 40px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="background-color:${BRAND.accent};border-radius:14px;padding:10px 24px;display:inline-block;margin-bottom:20px;">
                      <span style="font-size:12px;font-weight:900;letter-spacing:4px;color:#000000;text-transform:uppercase;">${BRAND.name}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                     <p style="margin:0;color:#94A3B8;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:2px;">Official Athlete Communications</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding:48px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#F1F5F9;padding:32px 40px;text-align:center;border-top:1px solid #E2E8F0;">
              <p style="color:#64748B;font-size:12px;font-weight:600;margin:0 0 12px 0;">© ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.</p>
              <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="padding:0 10px;">
                    <a href="${BRAND.baseUrl}" style="color:${BRAND.color};text-decoration:none;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1px;">Dashboard</a>
                  </td>
                  <td style="color:#CBD5E1;">•</td>
                  <td style="padding:0 10px;">
                    <a href="${BRAND.baseUrl}/athletes" style="color:${BRAND.color};text-decoration:none;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1px;">Athletes</a>
                  </td>
                </tr>
              </table>
              <p style="color:#94A3B8;font-size:10px;margin:20px 0 0 0;line-height:1.6;">You are receiving this because you are a registered member of the NLA Sports community. If you wish to manage your notifications, please visit your account settings.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// ─── Refined Helper Components ────────────────────────────────────────────────
const btnPrimary = (text, link) =>
  `<div style="text-align:center;margin-top:32px;">
    <a href="${link}" style="display:inline-block;background-color:${BRAND.color};color:#ffffff;font-weight:800;font-size:14px;padding:18px 36px;border-radius:16px;text-decoration:none;letter-spacing:0.5px;box-shadow:0 10px 20px rgba(29, 78, 216, 0.15);">${text}</a>
  </div>`;

const btnYellow = (text, link) =>
  `<div style="text-align:center;margin-top:32px;">
    <a href="${link}" style="display:inline-block;background-color:${BRAND.accent};color:#000000;font-weight:800;font-size:14px;padding:18px 36px;border-radius:16px;text-decoration:none;letter-spacing:0.5px;box-shadow:0 10px 20px rgba(250, 204, 21, 0.15);">${text}</a>
  </div>`;

const infoBox = (items) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8FAFC;border-radius:20px;padding:8px;margin:32px 0;border:1px solid #E2E8F0;">
    ${items.map(([label, value]) => `
    <tr>
      <td style="padding:16px 24px;border-bottom:1px solid #F1F5F9;">
        <p style="margin:0 0 4px 0;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#94A3B8;">${label}</p>
        <p style="margin:0;font-size:15px;font-weight:600;color:#0F172A;">${value}</p>
      </td>
    </tr>`).join('')}
  </table>`;

const alertBox = (text, type = 'info') => {
  const styles = {
    info: { bg: '#E0F2FE', border: '#7DD3FC', color: '#0369A1' },
    success: { bg: '#DCFCE7', border: '#86EFAC', color: '#15803D' },
    warning: { bg: '#FEF9C3', border: '#FDE047', color: '#854D0E' },
    error: { bg: '#FEE2E2', border: '#FCA5A5', color: '#B91C1C' }
  };
  const s = styles[type];
  return `<div style="background-color:${s.bg};border-left:4px solid ${s.border};border-radius:14px;padding:20px 24px;margin:32px 0;font-size:14px;font-weight:500;color:${s.color};line-height:1.6;">${text}</div>`;
};

const h1 = (text) => `<h1 style="margin:0 0 16px 0;font-size:32px;font-weight:800;color:#0F172A;letter-spacing:-1px;line-height:1.2;">${text}</h1>`;
const h2 = (text) => `<h2 style="margin:0 0 8px 0;font-size:20px;font-weight:700;color:#0F172A;line-height:1.3;">${text}</h2>`;
const para = (text) => `<p style="margin:0 0 20px 0;font-size:16px;color:#475569;line-height:1.8;font-weight:400;">${text}</p>`;
const divider = () => `<hr style="border:none;border-top:1px solid #E2E8F0;margin:32px 0;" />`;

// ═══════════════════════════════════════════════════════════════════════════════
//  EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════

const templates = {

  // 1. Welcome Email after Registration
  welcome: (name) => baseTemplate(`
    ${h1(`Welcome to ${BRAND.name}, ${name}! 🏆`)}
    ${para('Your athlete profile is now live. You are part of a community built to celebrate resilience, dedication, and the power of sport.')}
    ${alertBox('Your account is ready. Start by completing your profile and sharing your first story.', 'success')}
    ${divider()}
    ${btnYellow('Go to My Dashboard', `${BRAND.baseUrl}/dashboard`)}
  `),

  // 2. OTP / Forgot Password Email
  otp: (otp) => baseTemplate(`
    ${h1('Security Verification 🔐')}
    ${para('We received a request to access your account. Use the verification code below to proceed. This code expires in <strong>10 minutes</strong>.')}
    <div style="background-color:#0F172A;border-radius:24px;padding:48px;text-align:center;margin:32px 0;box-shadow:0 20px 40px rgba(15, 23, 42, 0.1);">
      <p style="margin:0 0 12px 0;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:4px;color:#94A3B8;">Verification Code</p>
      <p style="margin:0;font-size:56px;font-weight:800;color:${BRAND.accent};letter-spacing:16px;text-shadow: 0 0 20px rgba(250, 204, 21, 0.3);">${otp}</p>
    </div>
    ${alertBox('If you did not request this, please ignore this email. Your account remains secure.', 'warning')}
  `),

  // 3. New Inquiry → Athlete
  newInquiry: (athleteName, senderName, senderEmail, reason, message) => baseTemplate(`
    ${h1(`New Connection Request 📬`)}
    ${para(`Hi <strong>${athleteName}</strong>, someone wants to connect with you on ${BRAND.name}!`)}
    ${infoBox([
    ['From', senderName],
    ['Email', senderEmail],
    ['Reason', reason.charAt(0).toUpperCase() + reason.slice(1)],
  ])}
    <div style="background-color:#F8FAFC;border-radius:18px;padding:24px;margin:32px 0;border-left:5px solid ${BRAND.color};">
      <p style="margin:0 0 8px 0;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#94A3B8;">Personal Message</p>
      <p style="margin:0;font-size:16px;color:#0F172A;line-height:1.7;font-style:italic;">"${message}"</p>
    </div>
    ${divider()}
    ${para('Log in to your dashboard to view and reply to this inquiry.')}
    ${btnPrimary('View in Dashboard', `${BRAND.baseUrl}/dashboard`)}
  `),

  // 4. Athlete Reply → Sender
  inquiryReply: (senderName, athleteName, replyMessage) => baseTemplate(`
    ${h1(`${athleteName} replied to you! 🎉`)}
    ${para(`Hi <strong>${senderName}</strong>, your connection request on ${BRAND.name} has received a response.`)}
    <div style="background-color:#F8FAFC;border-radius:18px;padding:24px;margin:32px 0;border-left:5px solid ${BRAND.accent};">
      <p style="margin:0 0 8px 0;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#94A3B8;">Message from ${athleteName}</p>
      <p style="margin:0;font-size:16px;color:#0F172A;line-height:1.7;font-style:italic;">"${replyMessage}"</p>
    </div>
    ${divider()}
    ${btnYellow(`View ${athleteName}'s Profile`, `${BRAND.baseUrl}/users`)}
  `),

  // 5. New Story Submitted → Admin
  storySubmitted: (adminName, athleteName, athleteEmail, storyTitle) => baseTemplate(`
    ${h1('Story Pending Review 📝')}
    ${para(`Hi <strong>${adminName}</strong>, a new story has been submitted and is waiting for your approval.`)}
    ${infoBox([
    ['Athlete', athleteName],
    ['Email', athleteEmail],
    ['Story Title', storyTitle],
    ['Submitted At', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })],
  ])}
    ${divider()}
    ${btnPrimary('Review in Admin Panel', `${BRAND.adminUrl}/stories`)}
  `),

  // 6. Story Approved → Athlete
  storyApproved: (athleteName, storyTitle) => baseTemplate(`
    ${h1(`Your Story is Live! 🚀`)}
    ${alertBox(`Congratulations! Your story <strong>"${storyTitle}"</strong> has been approved and is now visible to the public.`, 'success')}
    ${para(`Hi <strong>${athleteName}</strong>, the NLA Sports team has reviewed your submission and it meets our community standards.`)}
    ${infoBox([
    ['Story Title', storyTitle],
    ['Status', '✅ Approved & Published'],
  ])}
    ${divider()}
    ${btnYellow('View My Story', `${BRAND.baseUrl}/stories`)}
  `),

  // 7. Story Rejected → Athlete
  storyRejected: (athleteName, storyTitle, reason) => baseTemplate(`
    ${h1('Story Update Required ✏️')}
    ${alertBox(`Your story <strong>"${storyTitle}"</strong> requires some changes before it can be published.`, 'warning')}
    ${para(`Hi <strong>${athleteName}</strong>, thank you for sharing your story. We've reviewed your submission and have some feedback.`)}
    ${reason ? `
    <div style="background-color:#FFF7ED;border-radius:18px;padding:24px;margin:32px 0;border-left:5px solid #FB923C;">
      <p style="margin:0 0 8px 0;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#94A3B8;">Reason for Revision</p>
      <p style="margin:0;font-size:16px;color:#0F172A;line-height:1.7;">${reason}</p>
    </div>` : ''}
    ${divider()}
    ${para('You can edit your story and resubmit it for review from your dashboard.')}
    ${btnPrimary('Edit My Story', `${BRAND.baseUrl}/dashboard`)}
  `),

  // 8. Admin Created Account → User Invitation
  invitation: (name, email, password) => baseTemplate(`
    ${h1(`Welcome to ${BRAND.name}, ${name}! 🏆`)}
    ${para(`An account has been created for you on the ${BRAND.name} platform. You can now log in and start sharing your journey with the world.`)}
    ${alertBox('Please log in using the credentials below and complete your profile information.', 'success')}
    ${infoBox([
    ['Email', email],
    ['Temporary Password', `<code>${password}</code>`],
  ])}
    ${divider()}
    ${para('For security reasons, we recommend changing your password after your first login.')}
    ${btnYellow('Log In to My Account', `${BRAND.baseUrl}/login`)}
  `),
};

// ─── Send Functions ───────────────────────────────────────────────────────────
const send = async (to, subject, html) => {
  await transporter.sendMail({ from: BRAND.from, to, subject, html });
  console.log(`[EMAIL] ✅ Sent to ${to}: "${subject}"`);
};

module.exports = {
  sendWelcomeEmail: (to, name) =>
    send(to, `Welcome to NLA Sports, ${name}! 🏆`, templates.welcome(name)),

  sendOtpEmail: (to, otp) =>
    send(to, 'Security Verification Code - NLA Sports', templates.otp(otp)),

  sendNewInquiryEmail: (athleteEmail, athleteName, senderName, senderEmail, reason, message) =>
    send(athleteEmail, `📬 New Connection Request from ${senderName}`, templates.newInquiry(athleteName, senderName, senderEmail, reason, message)),

  sendInquiryReplyEmail: (senderEmail, senderName, athleteName, replyMessage) =>
    send(senderEmail, `🎉 ${athleteName} replied to your inquiry`, templates.inquiryReply(senderName, athleteName, replyMessage)),

  sendStorySubmittedEmail: (adminEmail, adminName, athleteName, athleteEmail, storyTitle) =>
    send(adminEmail, `📝 New Story Pending Review: "${storyTitle}"`, templates.storySubmitted(adminName, athleteName, athleteEmail, storyTitle)),

  sendStoryApprovedEmail: (athleteEmail, athleteName, storyTitle) =>
    send(athleteEmail, `🚀 Your story "${storyTitle}" is now live!`, templates.storyApproved(athleteName, storyTitle)),

  sendStoryRejectedEmail: (athleteEmail, athleteName, storyTitle, reason) =>
    send(athleteEmail, `✏️ Your story "${storyTitle}" needs revision`, templates.storyRejected(athleteName, storyTitle, reason)),

  sendInvitationEmail: (to, name, password) =>
    send(to, `Welcome to ${BRAND.name}! Your account is ready 🏆`, templates.invitation(name, to, password)),
};
