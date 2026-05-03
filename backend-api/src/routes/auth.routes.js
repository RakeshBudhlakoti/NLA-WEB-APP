const express = require('express');
const router = express.Router();
console.log('✅ Auth Routes Loaded');
const { validate } = require('../middlewares/validate.middleware');
const { protect } = require('../middlewares/auth.middleware');
const { verifyCaptcha } = require('../middlewares/captcha.middleware');
const authValidations = require('../validations/auth.validation');
const authController = require('../controllers/auth.controller');

// hCaptcha required on OTP send and registration
router.post('/send-otp', verifyCaptcha, validate(authValidations.sendOtpSchema), authController.sendOtp);
router.post('/verify-otp', validate(authValidations.verifyOtpSchema), authController.verifyOtp);
router.post('/register', verifyCaptcha, validate(authValidations.registerSchema), authController.register);
router.post('/login', validate(authValidations.loginSchema), authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.get('/check-username/:username', authController.checkUsername);
router.get('/check-email', authController.checkEmail);
router.get('/me', protect, authController.getMe);

module.exports = router;
