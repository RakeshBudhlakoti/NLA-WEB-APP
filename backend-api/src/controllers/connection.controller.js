const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendSuccess, sendError } = require('../utils/response');
const emailService = require('../utils/email.service');

/**
 * @desc    Create a new connection request
 * @route   POST /api/v1/connections
 * @access  Public (optionalAuth)
 */
exports.createConnection = async (req, res) => {
  try {
    const { receiverId, name, email, reason, message } = req.body;
    const senderId = req.user ? req.user.id : null;

    if (!receiverId || !name || !email || !reason || !message) {
      return sendError(res, 'All fields are required', null, 400);
    }

    const connection = await prisma.connection.create({
      data: { senderId, receiverId, name, email, reason, message }
    });

    // Send email notification to the athlete
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      include: { profile: true }
    });

    if (receiver) {
      const athleteName = receiver.profile?.fullName || receiver.email;
      emailService.sendNewInquiryEmail(receiver.email, athleteName, name, email, reason, message);
    }

    return sendSuccess(res, 'Connection request sent successfully', connection, 201);
  } catch (error) {
    console.error('Error creating connection:', error);
    return sendError(res, 'Failed to send connection request', error.message);
  }
};

/**
 * @desc    Get all connection requests received by the logged-in athlete
 * @route   GET /api/v1/connections/received
 * @access  Private
 */
exports.getReceivedConnections = async (req, res) => {
  try {
    const connections = await prisma.connection.findMany({
      where: { receiverId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true, avatarUrl: true } }
          }
        }
      }
    });

    return sendSuccess(res, 'Connections fetched', connections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    return sendError(res, 'Failed to fetch connections', error.message);
  }
};

/**
 * @desc    Update connection status (mark as read)
 * @route   PUT /api/v1/connections/:id/status
 * @access  Private
 */
exports.updateConnectionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const connection = await prisma.connection.update({
      where: { id },
      data: { status }
    });

    return sendSuccess(res, 'Status updated successfully', connection);
  } catch (error) {
    console.error('Error updating connection status:', error);
    return sendError(res, 'Failed to update status', error.message);
  }
};

/**
 * @desc    Athlete replies to a connection inquiry (sends email)
 * @route   POST /api/v1/connections/:id/reply
 * @access  Private
 */
exports.replyToConnection = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;

    if (!replyMessage) {
      return sendError(res, 'Reply message is required', null, 400);
    }

    const connection = await prisma.connection.findUnique({ where: { id } });
    if (!connection) {
      return sendError(res, 'Connection not found', null, 404);
    }

    if (connection.receiverId !== req.user.id) {
      return sendError(res, 'Unauthorized', null, 403);
    }

    // Get athlete name
    const athlete = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true }
    });
    const athleteName = athlete?.profile?.fullName || athlete?.email || 'The Athlete';

    // Mark as REPLIED and send email
    const updated = await prisma.connection.update({
      where: { id },
      data: { status: 'REPLIED' }
    });

    // Send reply email to the original inquirer
    await emailService.sendInquiryReplyEmail(connection.email, connection.name, athleteName, replyMessage);

    return sendSuccess(res, 'Reply sent successfully', updated);
  } catch (error) {
    console.error('Error replying to connection:', error);
    return sendError(res, 'Failed to send reply', error.message);
  }
};
