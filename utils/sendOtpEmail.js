import { Resend } from "resend"

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char])

const sendOtpEmail = async ({ email, name, otp }) => {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"

  await resend.emails.send({
    from,
    to: email,
    subject: "Your Fitlifesutra password reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #111827;">
        <div style="background: #111827; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Fitlifesutra</h1>
        </div>
        <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="margin: 0 0 8px; font-size: 20px;">Password Reset OTP</h2>
          <p style="color: #6b7280; margin: 0 0 24px;">Hi ${escapeHtml(name || "there")}, use the code below to reset your password.</p>

          <div style="background: #ffffff; border: 2px dashed #d1d5db; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="margin: 0 0 4px; font-size: 12px; color: #9ca3af; letter-spacing: 0.05em; text-transform: uppercase;">Your OTP Code</p>
            <div style="font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #111827; font-family: monospace;">${escapeHtml(otp)}</div>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px;">
            ⏱️ This code expires in <strong>15 minutes</strong>.
          </p>
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            If you did not request a password reset, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  })
}

export default sendOtpEmail
