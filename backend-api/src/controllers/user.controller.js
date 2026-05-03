const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const { sendSuccess, sendError } = require('../utils/response');

const getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { profile: true }
    });
    if (!user) return sendError(res, 'User not found', null, 404);
    return sendSuccess(res, 'User fetched', user);
  } catch (error) {
    return sendError(res, 'Failed to fetch user', error.message);
  }
};

const updateMe = async (req, res) => {
  try {
    const { fullName, bio, tagline, city, avatarUrl, coverUrl, instagramUrl, twitterUrl, youtubeUrl, facebookUrl } = req.body;
    
    const profile = await prisma.profile.update({
      where: { userId: req.user.id },
      data: { fullName, bio, tagline, city, avatarUrl, coverUrl, instagramUrl, twitterUrl, youtubeUrl, facebookUrl }
    });

    return sendSuccess(res, 'Profile updated', profile);
  } catch (error) {
    return sendError(res, 'Failed to update profile', error.message);
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isDeleted: false, role: 'USER' },
      include: { profile: true }
    });
    return sendSuccess(res, 'Users fetched', users);
  } catch (error) {
    return sendError(res, 'Failed to fetch users', error.message);
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !user.passwordHash) return sendError(res, 'User not found', null, 404);

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) return sendError(res, 'Incorrect current password', null, 400);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash }
    });

    return sendSuccess(res, 'Password changed successfully');
  } catch (error) {
    return sendError(res, 'Failed to change password', error.message);
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('[DEBUG] Fetching dashboard stats for user ID:', userId);

    // Count posts (both stories and videos)
    const postCount = await prisma.post.count({
      where: { authorId: userId, isDeleted: false }
    });
    console.log('[DEBUG] Found posts count:', postCount);

    // Count total likes on all user's posts
    const totalLikes = await prisma.like.count({
      where: { 
        post: { 
          authorId: userId,
          isDeleted: false
        } 
      }
    });
    console.log('[DEBUG] Found total likes count:', totalLikes);

    const engagementRateValue = postCount > 0 ? ((totalLikes / postCount) * 10).toFixed(1) : "0";

    const stats = {
      postCount,
      totalLikes,
      engagementRate: engagementRateValue + '%'
    };
    
    console.log('[DEBUG] Returning stats:', stats);

    return sendSuccess(res, 'Stats fetched', stats);
  } catch (error) {
    console.error('[ERROR] Dashboard stats error:', error);
    return sendError(res, 'Failed to fetch stats', error.message);
  }
};

// GET /users/leaderboard — top athletes by likes + views
const getLeaderboard = async (req, res) => {
  try {
    // 1. Get Platform-wide Stats directly (Reliable)
    const [storyStats, likeCount, activeAthletesCount] = await Promise.all([
      prisma.post.aggregate({
        where: { status: 'APPROVED', isDeleted: false },
        _sum: { viewCount: true },
        _count: { id: true }
      }),
      prisma.like.count({
        where: { post: { status: 'APPROVED', isDeleted: false } }
      }),
      prisma.user.count({
        where: { isDeleted: false, isActive: true }
      })
    ]);

    // 2. Get Top Category
    const categoryAggregation = await prisma.post.groupBy({
      by: ['categoryId'],
      where: { status: 'APPROVED', isDeleted: false },
      _sum: { viewCount: true },
      orderBy: { _sum: { viewCount: 'desc' } },
      take: 1
    });

    let topCategoryName = 'General';
    if (categoryAggregation.length > 0 && categoryAggregation[0].categoryId) {
      const cat = await prisma.category.findUnique({
        where: { id: categoryAggregation[0].categoryId }
      });
      if (cat) topCategoryName = cat.name;
    }

    // 3. Get Ranked Athletes
    const athletes = await prisma.user.findMany({
      where: { isDeleted: false, isActive: true },
      include: {
        profile: true,
        posts: {
          where: { status: 'APPROVED', isDeleted: false },
          include: {
            _count: { select: { likes: true } }
          }
        }
      }
    });

    const ranked = athletes
      .map(u => {
        const posts = u.posts || [];
        const athleteLikes = posts.reduce((sum, p) => sum + (p._count?.likes || 0), 0);
        const athleteViews = posts.reduce((sum, p) => sum + (p.viewCount || 0), 0);
        const score = (athleteLikes * 5) + athleteViews;

        return {
          id: u.id,
          fullName: u.profile?.fullName || u.email.split('@')[0],
          avatarUrl: u.profile?.avatarUrl || null,
          tagline: u.profile?.tagline || 'NLA Athlete',
          storyCount: posts.length,
          totalLikes: athleteLikes,
          totalViews: athleteViews,
          score
        };
      })
      .filter(u => u.storyCount > 0)
      .sort((a, b) => b.score - a.score);

    const stats = {
      totalViews: storyStats._sum.viewCount || 0,
      totalLikes: likeCount || 0,
      totalAthletes: activeAthletesCount || 0,
      topCategory: topCategoryName,
      totalStories: storyStats._count.id || 0,
      debugId: Date.now() // Force a change in response
    };

    console.log('[DEBUG] Calculated Stats:', stats);

    return sendSuccess(res, 'Leaderboard fetched', { 
      leaderboard: ranked.slice(0, 50), 
      stats 
    });
  } catch (error) {
    console.error('Leaderboard Error:', error);
    return sendError(res, 'Failed to fetch leaderboard', error.message);
  }
};

module.exports = {
  getUserById,
  updateMe,
  getUsers,
  changePassword,
  getDashboardStats,
  getLeaderboard
};
