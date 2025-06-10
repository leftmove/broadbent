// Keeping this code commented out for potential future use
// import { Resend } from "@convex-dev/auth/providers/resend";
//
// export const ResendOTPPasswordReset = Resend({
//   // Your resend API key is in the Convex dashboard
//   // You can also use .env.local with RESEND_API_KEY
//   from: "Broadbent <no-reply@broadbent.com>",
//   mode: "otp",
//   timeout: 300, // 5 minutes
//   mailSettings: {
//     // for debugging the outgoing emails
//     // redirectAll: "youremail@yourdomain.com",
//   },
//   async render({ email, code }) {
//     return {
//       subject: `Reset your Broadbent password`,
//       // use text for compatibility
//       text: `Reset your password: ${code}`,
//       html: `
// <h1 style="color: #111827; margin-bottom: 24px;">Reset your password</h1>
// <p style="color: #6b7280; margin-bottom: 16px;">
// We received a request to reset your password for your Broadbent account.
// Use the code below to complete the password reset process:
// </p>
// <div style="
//   background-color: #f3f4f6;
//   border-radius: 6px;
//   padding: 16px;
//   margin-bottom: 24px;
//   font-size: 24px;
//   text-align: center;
//   letter-spacing: 0.1em;
//   font-family: monospace;
//   font-weight: 700;
// ">${code}</div>
// <p style="color: #6b7280; margin-bottom: 16px;">
// This code will expire in 5 minutes. If you did not request a password reset,
// please ignore this email or contact support if you have questions.
// </p>
// <p style="color: #6b7280;">
// Best,<br>
// The Broadbent Team
// </p>
//       `,
//     };
//   },
//   async onError(error) {
//     console.error("Failed to send password reset email:", error);
//     throw new Error("Could not send password reset email");
//   },
// });
