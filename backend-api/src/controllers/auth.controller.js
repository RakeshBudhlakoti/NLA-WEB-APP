const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendSuccess, sendError } = require('../utils/response');
const emailService = require('../utils/email.service');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });
  return { accessToken, refreshToken };
};

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 mins expiry

    await prisma.otpVerification.create({
      data: { email, otp, expiresAt }
    });

    // Send OTP via Email
    await emailService.sendOtpEmail(email, otp);

    return sendSuccess(res, 'OTP sent successfully');
  } catch (error) {
    return sendError(res, 'Failed to send OTP', error.message);
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await prisma.otpVerification.findFirst({
      where: { email, otp, isUsed: false, expiresAt: { gt: new Date() } }
    });

    if (!record) {
      return sendError(res, 'Invalid or expired OTP', null, 400);
    }

    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { isUsed: true }
    });

    return sendSuccess(res, 'OTP verified successfully');
  } catch (error) {
    return sendError(res, 'Verification failed', error.message);
  }
};

const register = async (req, res) => {
  try {
    const { email, username, password, fullName, avatarUrl } = req.body;

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) return sendError(res, 'Email already exists', null, 400);

    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) return sendError(res, 'Username already taken', null, 400);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        provider: 'local',
        isVerified: true, // Assuming OTP was verified before this
        profile: {
          create: { fullName, avatarUrl }
        }
      },
      include: { profile: true }
    });

    const tokens = generateTokens(user.id);

    // Notify admins of new registration
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          title: 'New User Registration',
          message: `${fullName} (${email}) has joined the platform.`,
          type: 'USER_REGISTERED',
          data: { authorName: fullName, email, userId: user.id },
          link: `/users/${user.id}`
        }))
      });
    }

    // Send welcome email
    await emailService.sendWelcomeEmail(email, fullName);

    return sendSuccess(res, 'Registration successful', { user, ...tokens }, 201);
  } catch (error) {
    return sendError(res, 'Registration failed', error.message);
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await prisma.user.findFirst({ 
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      },
      include: { profile: true }
    });

    if (!user || !user.passwordHash) {
      return sendError(res, 'Invalid credentials', null, 401);
    }
    
    if (user.isDeleted) {
      return sendError(res, 'Account has been deleted', null, 403);
    }
    if (!user.isActive) {
      return sendError(res, 'Account is inactive. Please contact administrator.', null, 403);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', null, 401);
    }

    const tokens = generateTokens(user.id);
    return sendSuccess(res, 'Login successful', { user, ...tokens });
  } catch (error) {
    return sendError(res, 'Login failed', error.message);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return sendError(res, 'No account found with this email', null, 404);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 mins

    await prisma.otpVerification.create({
      data: { email, otp, expiresAt, userId: user.id }
    });

    await emailService.sendOtpEmail(email, otp);
    return sendSuccess(res, 'Reset OTP sent to email');
  } catch (error) {
    return sendError(res, 'Failed to process request', error.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const record = await prisma.otpVerification.findFirst({
      where: { email, otp, isUsed: false, expiresAt: { gt: new Date() } }
    });

    if (!record) return sendError(res, 'Invalid or expired OTP', null, 400);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });

    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { isUsed: true }
    });

    return sendSuccess(res, 'Password reset successful');
  } catch (error) {
    return sendError(res, 'Reset failed', error.message);
  }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true }
    });
    return sendSuccess(res, 'Current user fetched', user);
  } catch (error) {
    return sendError(res, 'Failed to fetch user', error.message);
  }
};

const checkUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await prisma.user.findUnique({ where: { username } });
    return sendSuccess(res, 'Username availability checked', { available: !user });
  } catch (error) {
    return sendError(res, 'Failed to check username', error.message);
  }
};
const checkEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return sendError(res, 'Email is required', null, 400);
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    return sendSuccess(res, 'Email availability checked', { available: !user });
  } catch (error) {
    return sendError(res, 'Failed to check email', error.message);
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  checkUsername,
  checkEmail
};
