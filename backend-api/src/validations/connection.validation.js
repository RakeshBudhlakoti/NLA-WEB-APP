const { z } = require('zod');

const createConnectionSchema = z.object({
  body: z.object({
    receiverId: z.string().uuid('Invalid receiver ID'),
    name: z.string()
      .min(2, 'Name too short')
      .max(100, 'Name too long')
      .regex(/^[a-zA-Z\s\-'.]+$/, 'Name contains invalid characters'),
    email: z.string().email('Invalid email').max(254),
    reason: z.enum(['recruitment', 'sponsorship', 'media', 'fan'], {
      errorMap: () => ({ message: 'Invalid reason selected' })
    }),
    message: z.string()
      .min(10, 'Message must be at least 10 characters')
      .max(1000, 'Message too long (max 1000 characters)')
  })
});

const replyConnectionSchema = z.object({
  body: z.object({
    replyMessage: z.string()
      .min(5, 'Reply too short')
      .max(1000, 'Reply too long (max 1000 characters)')
  })
});

module.exports = { createConnectionSchema, replyConnectionSchema };
