import nodemailer from "nodemailer";

// Create a transporter
function createTransporter() {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

/**
 * Send OTP email
 */
export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@raktosewa.com",
      to: email,
      subject: "Raktosewa - Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #dc2626; margin: 0;">Raktosewa</h2>
            <p style="color: #6b7280; margin: 10px 0 0 0;">Password Reset Request</p>
          </div>
          
          <div style="padding: 20px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="color: #1f2937; margin-top: 0;">Reset Your Password</h3>
            <p style="color: #4b5563; line-height: 1.6;">
              We received a request to reset your password. Use the OTP below to proceed with your password reset:
            </p>
            
            <div style="background-color: #f0fdf4; border: 2px solid #86efac; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Your OTP Code</p>
              <p style="color: #16a34a; font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 0;">
                ${otp}
              </p>
              <p style="color: #999; margin: 10px 0 0 0; font-size: 12px;">Valid for 10 minutes</p>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6;">
              <strong>Important:</strong>
            </p>
            <ul style="color: #4b5563; line-height: 1.8;">
              <li>Never share this OTP with anyone</li>
              <li>This OTP will expire in 10 minutes</li>
              <li>If you did not request this, please ignore this email</li>
            </ul>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; margin-top: 20px;">
            <p>© 2024 Raktosewa. All rights reserved.</p>
            <p>This is an automated email, please do not reply to this email.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent successfully to ${email}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

/**
 * Send password reset confirmation email
 */
export const sendPasswordResetConfirmation = async (
  email: string,
  userName: string
): Promise<void> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@raktosewa.com",
      to: email,
      subject: "Raktosewa - Password Reset Successful",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #dc2626; margin: 0;">Raktosewa</h2>
            <p style="color: #6b7280; margin: 10px 0 0 0;">Password Reset Confirmation</p>
          </div>
          
          <div style="padding: 20px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="color: #1f2937; margin-top: 0;">Password Reset Successful</h3>
            <p style="color: #4b5563; line-height: 1.6;">
              Hi ${userName},
            </p>
            <p style="color: #4b5563; line-height: 1.6;">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            
            <div style="background-color: #dbeafe; border-left: 4px solid #0284c7; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="color: #075985; margin: 0;">
                <strong>If you did not perform this action,</strong> please contact our support team immediately.
              </p>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6;">
              You can now log in to your Raktosewa account with your updated credentials.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; margin-top: 20px;">
            <p>© 2024 Raktosewa. All rights reserved.</p>
            <p>This is an automated email, please do not reply to this email.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${email}`);
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    throw new Error("Failed to send confirmation email");
  }
};
