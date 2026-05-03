const { sendError } = require('../utils/response');

/**
 * Middleware: verify Google reCAPTCHA v2 token sent from frontend.
 * Expects `captchaToken` field in req.body.
 */
const verifyCaptcha = async (req, res, next) => {
  const token = req.body.captchaToken;

  if (!token) {
    return sendError(res, 'CAPTCHA verification required', null, 400);
  }

  try {
    const params = new URLSearchParams({
      secret: process.env.RECAPTCHA_SECRET,
      response: token,
      remoteip: req.ip
    });

    const response = await fetch(
      `${process.env.RECAPTCHA_VERIFY_URL}?${params.toString()}`,
      { method: 'POST' }
    );

    const data = await response.json();

    if (!data.success) {
      console.warn('[reCAPTCHA] Verification failed:', data['error-codes']);
      return sendError(res, 'CAPTCHA verification failed. Please try again.', null, 400);
    }

    // Remove token from body so it doesn't reach the DB
    delete req.body.captchaToken;
    next();
  } catch (err) {
    console.error('[reCAPTCHA] Error during verification:', err.message);
    return sendError(res, 'CAPTCHA service unavailable', null, 503);
  }
};

module.exports = { verifyCaptcha };
