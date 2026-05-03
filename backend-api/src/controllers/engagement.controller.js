const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendSuccess, sendError } = require('../utils/response');

const likePost = async (req, res) => {
  try {
    const like = await prisma.like.create({
      data: {
        postId: req.params.postId,
        userId: req.user.id
      }
    });
    return sendSuccess(res, 'Post liked', like, 201);
  } catch (error) {
    if (error.code === 'P2002') {
      return sendError(res, 'Already liked', null, 400);
    }
    return sendError(res, 'Failed to like post', error.message);
  }
};

const unlikePost = async (req, res) => {
  try {
    await prisma.like.deleteMany({
      where: {
        postId: req.params.postId,
        userId: req.user.id
      }
    });
    return sendSuccess(res, 'Post unliked');
  } catch (error) {
    return sendError(res, 'Failed to unlike post', error.message);
  }
};

const addComment = async (req, res) => {
  try {
    const { postId, content } = req.body;
    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        userId: req.user.id
      }
    });
    return sendSuccess(res, 'Comment added', comment, 201);
  } catch (error) {
    return sendError(res, 'Failed to add comment', error.message);
  }
};

const getComments = async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId: req.query.postId, isDeleted: false },
      include: { user: { select: { id: true, profile: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return sendSuccess(res, 'Comments fetched', comments);
  } catch (error) {
    return sendError(res, 'Failed to fetch comments', error.message);
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
    
    if (!comment) return sendError(res, 'Comment not found', null, 404);
    if (comment.userId !== req.user.id && req.user.role !== 'ADMIN') return sendError(res, 'Unauthorized', null, 403);

    await prisma.comment.update({
      where: { id: req.params.id },
      data: { isDeleted: true }
    });

    return sendSuccess(res, 'Comment deleted');
  } catch (error) {
    return sendError(res, 'Failed to delete comment', error.message);
  }
};

const checkLike = async (req, res) => {
  try {
    const like = await prisma.like.findFirst({
      where: {
        postId: req.params.postId,
        userId: req.user.id
      }
    });
    return sendSuccess(res, 'Like check', { hasLiked: !!like });
  } catch (error) {
    return sendError(res, 'Failed to check like', error.message);
  }
};

module.exports = {
  likePost,
  unlikePost,
  addComment,
  getComments,
  deleteComment,
  checkLike
};
