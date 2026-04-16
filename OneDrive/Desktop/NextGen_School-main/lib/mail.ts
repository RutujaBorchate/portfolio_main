import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string
  subject: string
  text: string
  html?: string
}) {
  // If SMTP is not configured, log to console for development
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("------------------------------------------")
    console.log("📧 EMAIL (MOCKED - CONFIGURE SMTP IN ENV)")
    console.log("To:", to)
    console.log("Subject:", subject)
    console.log("Body:", text)
    console.log("------------------------------------------")
    return { success: true, mocked: true }
  }

  try {
    const info = await transporter.sendMail({
      from: `"NextGen School" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html: html || text,
    })
    console.log("Email sent: %s", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

export const mailTemplates = {
  enrollmentApproved: (studentName: string, courseTitle: string) => ({
    subject: `Congratulations! Your enrollment in ${courseTitle} was approved!`,
    text: `Hi ${studentName},\n\nGreat news! Your teacher has approved your enrollment in "${courseTitle}". You can now access all the modules, quizzes, and assignments.\n\nStart learning here: ${process.env.NEXTAUTH_URL}/dashboard/student/courses\n\nHappy Learning!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #8b5cf6;">Welcome Aboard! 🎉</h2>
        <p>Hi <strong>${studentName}</strong>,</p>
        <p>Great news! Your teacher has approved your enrollment in <strong>"${courseTitle}"</strong>.</p>
        <p>You can now access all the lessons, take quizzes, and submit your assignments.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${process.env.NEXTAUTH_URL}/dashboard/student/courses" style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Start Learning Now</a>
        </div>
        <p>Happy Learning!<br/>The NextGen School Team</p>
      </div>
    `
  }),
  certificateIssued: (studentName: string, courseTitle: string, certNumber: string) => ({
    subject: `Achievement Unlocked: Your Certificate for ${courseTitle}!`,
    text: `Hi ${studentName},\n\nYou did it! Your official certificate for completing "${courseTitle}" has been issued.\n\nYour Certificate ID: ${certNumber}\n\nView it here: ${process.env.NEXTAUTH_URL}/verify-certificate/${certNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #10b981;">Achievement Unlocked! 🏆</h2>
        <p>Hi <strong>${studentName}</strong>,</p>
        <p>You did it! Your official certificate for completing <strong>"${courseTitle}"</strong> has been issued.</p>
        <p><strong>Certificate ID:</strong> ${certNumber}</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${process.env.NEXTAUTH_URL}/verify-certificate/${certNumber}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Certificate</a>
        </div>
        <p>This is a significant milestone in your learning journey. Feel free to share it on LinkedIn or your portfolio!</p>
        <p>Keep up the great work!<br/>The NextGen School Team</p>
      </div>
    `
  })
}
