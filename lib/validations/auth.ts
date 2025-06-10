import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  // Keeping these commented out for potential future use
  // password: z
  //   .string()
  //   .min(8, { message: "Password must be at least 8 characters" }),
});

export const signUpSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  // Keeping these commented out for potential future use
  // password: z
  //   .string()
  //   .min(8, { message: "Password must be at least 8 characters" }),
  // confirmPassword: z.string(),
});
// .refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords do not match",
//   path: ["confirmPassword"],
// });

// Keeping these commented out for potential future use
// export const resetPasswordSchema = z.object({
//   email: z.string().email({ message: "Please enter a valid email address" }),
// });

// export const newPasswordSchema = z
//   .object({
//     password: z
//       .string()
//       .min(8, { message: "Password must be at least 8 characters" }),
//     confirmPassword: z.string(),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords do not match",
//     path: ["confirmPassword"],
//   });

export type SignInFormValues = z.infer<typeof signInSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
// export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
// export type NewPasswordFormValues = z.infer<typeof newPasswordSchema>;
