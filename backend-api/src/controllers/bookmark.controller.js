const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendSuccess, sendError } = require('../utils/response');

// POST /bookmarks/:postId — toggle bookmark
const toggleBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    const existing = await prisma.bookmark.findUnique({
      where: { postId_userId: { postId, userId } }
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return sendSuccess(res, 'Bookmark removed', { bookmarked: false });
    }

    await prisma.bookmark.create({ data: { postId, userId } });
    return sendSuccess(res, 'Story bookmarked', { bookmarked: true });
  } catch (err) {
    return sendError(res, 'Failed to toggle bookmark', err.message, 500);
  }
};

// GET /bookmarks — get all bookmarked stories for logged-in user
const getBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          include: {
            author: { select: { id: true, profile: { select: { fullName: true, avatarUrl: true } } } },
            _count: { select: { likes: true, comments: true } }
          }
        }
      }
    });

    const posts = bookmarks.map(b => b.post).filter(p => p && !p.isDeleted && p.status === 'APPROVED');
    return sendSuccess(res, 'Bookmarks fetched', { bookmarks: posts });
  } catch (err) {
    return sendError(res, 'Failed to fetch bookmarks', err.message, 500);
  }
};

// GET /bookmarks/ids — get just the IDs the user has bookmarked (for UI state)
const getBookmarkIds = async (req, res) => {
  try {
    if (!req.user) return sendSuccess(res, 'Not logged in', { ids: [] });
    
    const userId = req.user.id;
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      select: { postId: true }
    });
    return sendSuccess(res, 'Bookmark IDs fetched', { ids: bookmarks.map(b => b.postId) });
  } catch (err) {
    return sendError(res, 'Failed to fetch bookmark IDs', err.message, 500);
  }
};

module.exports = { toggleBookmark, getBookmarks, getBookmarkIds };
