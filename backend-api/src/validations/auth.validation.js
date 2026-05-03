const { z } = require('zod');

const sendOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format').max(254).toLowerCase()
  })
});

const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email().max(254),
    otp: z.string().length(6).regex(/^\d{6}$/, 'OTP must be 6 digits only')
  })
});

const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email').max(254),
    username: z.string().min(3, 'Username must be at least 3 characters').max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password too long')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    fullName: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name too long')
      .regex(/^[a-zA-Z\s\-'.]+$/, 'Name can only contain letters, spaces, hyphens and apostrophes'),
    avatarUrl: z.string().optional()
  })
});

const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(1, 'Email or Username is required').max(254),
    password: z.string().min(1, 'Password is required').max(128)
  })
});

const socialLoginSchema = z.object({
  body: z.object({
    provider: z.enum(['google', 'facebook']),
    access_token: z.string().min(1, 'Access token is required').max(2048)
  })
});

module.exports = {
  sendOtpSchema,
  verifyOtpSchema,
  registerSchema,
  loginSchema,
  socialLoginSchema
};
