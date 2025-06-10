// Keeping this code commented out for potential future use
// import Resend from "@auth/core/providers/resend";
// import { Resend as ResendAPI } from "resend";
// import { alphabet, generateRandomString } from "oslo/crypto";
//
// export const ResendOTP = Resend({
//   id: "resend-otp",
//   apiKey: process.env.AUTH_RESEND_KEY,
//   async generateVerificationToken() {
//     return generateRandomString(8, alphabet("0-9"));
//   },
//   async sendVerificationRequest({ identifier: email, provider, token }) {
//     const resend = new ResendAPI(provider.apiKey);
//     const { error } = await resend.emails.send({
//       from: "Broadbent <noreply@broadbent.app>",
//       to: [email],
//       subject: `Verify your email for Broadbent`,
//       html: `
//         <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
//           <h1 style="color: #111827; margin-bottom: 24px;">Verify your email</h1>
//           <p style="margin-bottom: 24px; color: #4B5563;">
//             Thanks for signing up for Broadbent! Please use the code below to verify your email address:
//           </p>
//           <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
//             <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #111827;">
//               ${token}
//             </p>
//           </div>
//           <p style="margin-bottom: 24px; color: #4B5563;">
//             If you didn't request this, you can safely ignore this email.
//           </p>
//           <p style="color: #6B7280; font-size: 14px;">
//             &copy; ${new Date().getFullYear()} Broadbent. All rights reserved.
//           </p>
//         </div>
//       `,
//     });
//
//     if (error) {
//       throw new Error("Could not send verification email");
//     }
//   },
// });
