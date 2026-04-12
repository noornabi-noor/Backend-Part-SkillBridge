// //src/lib/auth.ts
// import { betterAuth } from "better-auth";
// import { prismaAdapter } from "better-auth/adapters/prisma";
// import { prisma } from "./prisma";
// import { envVars } from "../config/env.config";

// import nodemailer from "nodemailer";

// // nodemailer for email verification
// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: envVars.APP_USER,
//     pass: envVars.APP_PASS,
//   },
// });

// export const auth = betterAuth({
//   baseURL: envVars.BETTER_AUTH_URL,
//   database: prismaAdapter(prisma, { provider: "postgresql" }),
//   trustedOrigins: [envVars.APP_URL!,
//     "http://localhost:3000",
//   ],

//   // trustedOrigins: [
//   //   "https://skillbridge-frontend-liard.vercel.app",
//   //   "https://skill-bridge-mocha.vercel.app",
//   //   "https://skillbridge-0r8a.onrender.com",
//   // ],

//   session: {
//     cookieCache: {
//       secure: true,
//       enabled: true,
//       maxAge: 5 * 60, // 5 minutes
//       // sameSite: "lax",
//       sameSite: "none",
//       httpOnly: true,
//       path: "/",
//     },
//   },
//   advanced: {
//     cookiePrefix: "better-auth",
//     useSecureCookies: envVars.NODE_ENV === "production",
//     // useSecureCookies: true,
//     crossSubDomainCookies: {
//       enabled: false,
//     },
//     // disableCSRFCheck: true,
//   },

//   // session: {
//   //   cookieCache: {
//   //     secure: true,
//   //     enabled: true,
//   //     maxAge: 5 * 60,
//   //     sameSite: "lax",
//   //     httpOnly: true,
//   //     path: "/",
//   //   },
//   // },
//   // advanced: {
//   //   useSecureCookies: true,
//   //   cookiePrefix: "__Secure-better-auth",
//   // },

//   // advanced: {
//   //   useSecureCookies: true,
//   //   defaultCookieAttributes: {
//   //     sameSite: "none",
//   //     secure: true,
//   //   },
//   //   // ADD THIS SECTION: Specifically target the 'state' cookie
//   //   cookies: {
//   //     state: {
//   //       attributes: {
//   //         sameSite: "none",
//   //         secure: true,
//   //       },
//   //     },
//   //   },
//   // },

//   // advanced: {
//   //   defaultCookieAttributes: {
//   //     sameSite: "lax",
//   //     secure: true,
//   //     httpOnly: true,
//   //     // partitioned: true,
//   //   },
//   // },

//   emailAndPassword: {
//     enabled: true,
//     autoSignIn: false,
//     requireEmailVerification: true,
//   },

//   // additional field added within user table
//   user: {
//     additionalFields: {
//       role: {
//         type: "string",
//         defaultValue: "STUDENT",
//         required: false,
//       },
//       phone: {
//         type: "string",
//         required: false,
//       },
//       image: {
//         type: "string",
//         required: false,
//       },
//     },
//   },

//   // Email verification part by nodemailer
//   emailVerification: {
//     sendOnSignUp: true,
//     autoSignInAfterVerification: true, //after sign up automatic sign in app
//     sendVerificationEmail: async ({ user, url, token }, request) => {
//       try {
//         const verifationUrl = `${envVars.APP_URL}/verify-email?token=${token}`;
//         const info = await transporter.sendMail({
//           from: '"SkillBridge" <skillbridge@gmail.com>',
//           to: user.email,
//           subject: "Please Verify Your Email!",
//           html: `<!DOCTYPE html>
// <html lang="en">
//   <head>
//     <meta charset="UTF-8" />
//     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//     <title>Email Verification</title>
//   </head>
//   <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
//     <table width="100%" cellpadding="0" cellspacing="0">
//       <tr>
//         <td align="center" style="padding: 40px 0;">
//           <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
            
//             <!-- Header -->
//             <tr>
//               <td style="background-color: #4f46e5; padding: 20px; text-align: center;">
//                 <h1 style="color: #ffffff; margin: 0;">SkillBridge</h1>
//               </td>
//             </tr>

//             <!-- Body -->
//             <tr>
//               <td style="padding: 30px; color: #333333;">
//                 <h2 style="margin-top: 0;">Verify your email address</h2>
//                 <p>
//                   Thanks for creating an account! Please confirm your email address by clicking the button below.
//                 </p>

//                 <div style="text-align: center; margin: 30px 0;">
//                   <a
//                     href="${verifationUrl}"
//                     style="
//                       background-color: #4f46e5;
//                       color: #ffffff;
//                       padding: 12px 24px;
//                       text-decoration: none;
//                       border-radius: 6px;
//                       display: inline-block;
//                       font-weight: bold;
//                     "
//                   >
//                     Verify Email
//                   </a>
//                 </div>

//                 <p>
//                   If you didn’t create this account, you can safely ignore this email.
//                 </p>

//                 <p style="font-size: 14px; color: #777777;">
//                   This link will expire in a limited time.
//                 </p>
//               </td>
//             </tr>

//             <!-- Footer -->
//             <tr>
//               <td style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #777777;">
//                 © 2026 SkillBridge. All rights reserved.
//               </td>
//             </tr>
//           </table>
//         </td>
//       </tr>
//     </table>
//   </body>
// </html>
// `,
//         });
//         // console.log("Message sent:", info.messageId);
//       } catch (error) {
//         console.error(error);
//         throw error;
//       }
//     },
//   },

//   socialProviders: {
//     google: {
//       clientId: envVars.GOOGLE_CLIENT_ID!,
//       clientSecret: envVars.GOOGLE_CLIENT_SECRET!,
//       accessType: "offline",
//       prompt: "select_account consent",
//     },
//   },

//   redirectTo: envVars.APP_URL,
//   // redirectTo: process.env.BETTER_AUTH_URL,
// });




import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { bearer, emailOTP } from "better-auth/plugins";
import { envVars } from "../config/env.config";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import { sendEmail } from "../utils/email";


export const auth = betterAuth({
  baseURL: envVars.BETTER_AUTH_URL,
  secret: envVars.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  socialProviders: {
    google: {
      // enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,

      mapProfileToUser: () => {
        return {
          role: Role.STUDENT,
          status: UserStatus.ACTIVE,
          needPasswordChanged: false,
          emailVerified: true,
          isDeleted: false,
          deletedAt: null,
        };
      },
    },
  },

  emailVerification: {
    sendOnSignIn: true,
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Role.STUDENT,
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE,
      },
      needPasswordChanged: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      isDeleted: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null,
      },
    },
  },

  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          const user = await prisma.user.findUnique({
            where: {
              email,
            }
          })

          if (!user) {
            console.error(`User with email ${email} not found. Cannot send verification OTP.`);
            return;
          }

          if (user && user.role === Role.ADMIN) {
            console.log(`User with email ${email} is a super admin. Skipping sending verification OTP.`);
            return;
          }

          if (user && !user.emailVerified) {
            sendEmail({
              to: email,
              subject: "Verify your email",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp,
              }
            })
          }
        } else if (type === "forget-password") {
          const user = await prisma.user.findUnique({
            where: {
              email,
            }
          })

          if (user) {
            sendEmail({
              to: email,
              subject: "Password Reset OTP",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp,
              }
            })
          }
        }
      },
      expiresIn: 2 * 60, // 2 minutes in seconds
      otpLength: 6,
    })
  ],

  session: {
    expiresIn: 60 * 60 * 60 * 24,
    updateAge: 60 * 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 60 * 24,
    },
  },

  redirectURLs: {
    signIn: `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success`,
  },

  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:5000", envVars.PROD_APP_URL],

  advanced: {
    // disableCSRFCheck: true,
    useSecureCookies: false,
    cookies: {
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/",
        }
      },
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/",
        }
      }
    }
  },
});
