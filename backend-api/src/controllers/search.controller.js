const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendSuccess, sendError } = require('../utils/response');

const search = async (req, res) => {
  try {
    const { q = '' } = req.query;
    
    const posts = await prisma.post.findMany({
      where: {
        isDeleted: false,
        status: 'APPROVED',
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { content: { contains: q, mode: 'insensitive' } },
          { author: { profile: { fullName: { contains: q, mode: 'insensitive' } } } }
        ]
      },
      include: { author: { select: { id: true, profile: true } } },
      take: 20
    });
    
    return sendSuccess(res, 'Search results', posts);
  } catch (error) {
    return sendError(res, 'Search failed', error.message);
  }
};

const getTrending = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { isDeleted: false, status: 'APPROVED' },
      include: { author: { select: { id: true, profile: true } } },
      orderBy: { viewCount: 'desc' },
      take: 10
    });
    return sendSuccess(res, 'Trending posts', posts);
  } catch (error) {
    return sendError(res, 'Failed to fetch trending', error.message);
  }
};

const getRecommended = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { isDeleted: false, status: 'APPROVED' },
      include: { author: { select: { id: true, profile: true } } },
      orderBy: { createdAt: 'desc' }, // Simple mock logic for recommendation
      take: 10
    });
    return sendSuccess(res, 'Recommended posts', posts);
  } catch (error) {
    return sendError(res, 'Failed to fetch recommended', error.message);
  }
};

module.exports = { search, getTrending, getRecommended };
