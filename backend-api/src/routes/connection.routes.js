const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connection.controller');
const { protect, optionalAuth } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { verifyCaptcha } = require('../middlewares/captcha.middleware');
const { connectionLimiter } = require('../middlewares/rate-limit.middleware');
const { createConnectionSchema, replyConnectionSchema } = require('../validations/connection.validation');

// Limit connection requests and replies to prevent spam
router.post('/', optionalAuth, connectionLimiter, verifyCaptcha, validate(createConnectionSchema), connectionController.createConnection);
router.get('/received', protect, connectionController.getReceivedConnections);
router.put('/:id/status', protect, connectionController.updateConnectionStatus);
router.post('/:id/reply', protect, connectionLimiter, validate(replyConnectionSchema), connectionController.replyToConnection);

module.exports = router;
