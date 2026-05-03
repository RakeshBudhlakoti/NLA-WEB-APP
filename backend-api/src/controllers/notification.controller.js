const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendSuccess, sendError } = require('../utils/response');

const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where: { userId: req.user.id } })
    ]);
    
    return sendSuccess(res, 'Notifications fetched', notifications);
  } catch (error) {
    return sendError(res, 'Failed to fetch notifications', error.message);
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
    
    if (!notification) return sendError(res, 'Notification not found', null, 404);
    if (notification.userId !== req.user.id) return sendError(res, 'Unauthorized', null, 403);

    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true }
    });

    return sendSuccess(res, 'Notification marked as read', updated);
  } catch (error) {
    return sendError(res, 'Failed to update notification', error.message);
  }
};

const markAllRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });

    return sendSuccess(res, 'All notifications marked as read');
  } catch (error) {
    return sendError(res, 'Failed to update notifications', error.message);
  }
};

module.exports = { getNotifications, markAsRead, markAllRead };
