const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
const { sendSuccess, sendError } = require('../utils/response');
const emailService = require('../utils/email.service');

const getAdminPosts = async (req, res) => {
  try {
    const { status, search, userId, categoryId, page = 1, limit = 10 } = req.query;
    console.log('Fetching admin posts. Filters:', { userId, categoryId, status });
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let where = {};
    
    if (userId && typeof userId === 'string' && userId !== 'undefined' && userId !== 'null' && userId.trim() !== '') {
      where.authorId = userId;
    }

    if (categoryId && typeof categoryId === 'string' && categoryId !== 'undefined' && categoryId !== 'null' && categoryId.trim() !== '') {
      where.categoryId = categoryId;
    }

    if (status === 'TRASH') {
      where.isDeleted = true;
    } else {
      where.isDeleted = false;
      if (status && status !== 'ALL') {
        where.status = status;
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    console.log('Final Prisma where:', JSON.stringify(where, null, 2));

    const baseWhere = {};
    if (userId && typeof userId === 'string' && userId !== 'undefined' && userId !== 'null' && userId.trim() !== '') {
      baseWhere.authorId = userId;
    }
    if (categoryId && typeof categoryId === 'string' && categoryId !== 'undefined' && categoryId !== 'null' && categoryId.trim() !== '') {
      baseWhere.categoryId = categoryId;
    }

    const [posts, total, allCount, pendingCount, approvedCount, rejectedCount, trashCount] = await Promise.all([
      prisma.post.findMany({
        where,
        include: { 
          author: { select: { id: true, email: true, profile: true } }, 
          category: true,
          _count: { select: { likes: true, comments: true } }
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.post.count({ where }),
      prisma.post.count({ where: { ...baseWhere, isDeleted: false } }),
      prisma.post.count({ where: { ...baseWhere, isDeleted: false, status: 'PENDING' } }),
      prisma.post.count({ where: { ...baseWhere, isDeleted: false, status: 'APPROVED' } }),
      prisma.post.count({ where: { ...baseWhere, isDeleted: false, status: 'REJECTED' } }),
      prisma.post.count({ where: { ...baseWhere, isDeleted: true } })
    ]);
    
    return sendSuccess(res, 'Admin posts fetched', {
      posts,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
      statusCounts: {
        ALL: allCount,
        PENDING: pendingCount,
        APPROVED: approvedCount,
        REJECTED: rejectedCount,
        TRASH: trashCount
      }
    });
  } catch (error) {
    console.error('getAdminPosts Error:', error);
    return sendError(res, 'Failed to fetch posts', error.message);
  }
};

const approvePost = async (req, res) => {
  try {
    const post = await prisma.post.update({
      where: { id: req.params.id },
      data: { status: 'APPROVED' },
      include: { author: { include: { profile: true } } }
    });

    // Send email to athlete
    const athleteEmail = post.author?.email;
    const athleteName = post.author?.profile?.fullName || post.author?.email || 'Athlete';
    if (athleteEmail) {
      emailService.sendStoryApprovedEmail(athleteEmail, athleteName, post.title);
    }

    return sendSuccess(res, 'Post approved', post);
  } catch (error) {
    return sendError(res, 'Failed to approve post', error.message);
  }
};

const rejectPost = async (req, res) => {
  try {
    const { rejectReason } = req.body;
    const post = await prisma.post.update({
      where: { id: req.params.id },
      data: { status: 'REJECTED', rejectReason: rejectReason || null },
      include: { author: { include: { profile: true } } }
    });

    // Notify the user about rejection
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        title: 'Story Rejected',
        message: `Your story "${post.title}" was rejected. Reason: ${rejectReason || 'Not specified'}`
      }
    });

    // Send rejection email to athlete
    const athleteEmail = post.author?.email;
    const athleteName = post.author?.profile?.fullName || post.author?.email || 'Athlete';
    if (athleteEmail) {
      emailService.sendStoryRejectedEmail(athleteEmail, athleteName, post.title, rejectReason);
    }

    return sendSuccess(res, 'Post rejected', post);
  } catch (error) {
    return sendError(res, 'Failed to reject post', error.message);
  }
};

const deleteAdminPost = async (req, res) => {
  try {
    const post = await prisma.post.update({
      where: { id: req.params.id },
      data: { isDeleted: true }
    });

    return sendSuccess(res, 'Post soft deleted');
  } catch (error) {
    return sendError(res, 'Failed to delete post', error.message);
  }
};

const getDeletedPosts = async (req, res) => {
  try {
    const { userId, page: qPage = 1, limit: qLimit = 10 } = req.query;
    const page = parseInt(qPage) || 1;
    const limit = parseInt(qLimit) || 10;
    const skip = (page - 1) * limit;

    const where = { isDeleted: true };
    if (userId && typeof userId === 'string' && userId !== 'undefined' && userId !== 'null' && userId.trim() !== '') {
      where.authorId = userId;
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: { author: { select: { id: true, email: true, profile: true } }, category: true },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.post.count({ where })
    ]);
    return sendSuccess(res, 'Deleted posts fetched', {
      posts,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch deleted posts', error.message);
  }
};

const restorePost = async (req, res) => {
  try {
    const post = await prisma.post.update({
      where: { id: req.params.id },
      data: { isDeleted: false }
    });

    return sendSuccess(res, 'Post restored');
  } catch (error) {
    return sendError(res, 'Failed to restore post', error.message);
  }
};

const getAdminUsers = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let where = {};
    
    if (status === 'TRASH') {
      where.isDeleted = true;
    } else {
      where.isDeleted = false;
      if (status === 'ACTIVE') where.isActive = true;
      if (status === 'INACTIVE') where.isActive = false;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { profile: { fullName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [users, total, allCount, activeCount, inactiveCount, trashCount] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { 
          profile: true,
          _count: {
            select: {
              posts: {
                where: { isDeleted: false }
              }
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.user.count({ where }),
      prisma.user.count({ where: { isDeleted: false } }),
      prisma.user.count({ where: { isDeleted: false, isActive: true } }),
      prisma.user.count({ where: { isDeleted: false, isActive: false } }),
      prisma.user.count({ where: { isDeleted: true } })
    ]);

    // Explicitly mapping to ensure the frontend receives the expected structure
    const usersWithCounts = users.map(user => ({
      ...user,
      _count: {
        posts: user._count.posts
      }
    }));

    return sendSuccess(res, 'Admin users fetched', {
      users: usersWithCounts,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
      statusCounts: {
        ALL: allCount,
        ACTIVE: activeCount,
        INACTIVE: inactiveCount,
        TRASH: trashCount
      }
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch users', error.message);
  }
};

const createAdminUser = async (req, res) => {
  try {
    const { fullName, email, username, password: providedPassword, role = 'USER' } = req.body;

    if (!username) return sendError(res, 'Username is required', null, 400);

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) return sendError(res, 'Email already in use', null, 400);

    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) return sendError(res, 'Username already taken', null, 400);

    // Generate password if not provided
    const password = providedPassword || Math.random().toString(36).slice(-10);
    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        username: username || null,
        passwordHash,
        role,
        isVerified: true,
        profile: {
          create: { fullName }
        }
      },
      include: { profile: true }
    });

    // Send invitation email
    await emailService.sendInvitationEmail(email, fullName, password);

    return sendSuccess(res, 'User created successfully and invitation sent', { user, temporaryPassword: password }, 201);
  } catch (error) {
    return sendError(res, 'Failed to create user', error.message);
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return sendError(res, 'User not found', null, 404);
    
    // Prevent toggling status for admins
    if (user.role === 'ADMIN') {
      return sendError(res, 'Administrator status cannot be toggled', null, 403);
    }
    
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !user.isActive },
      include: { profile: true }
    });

    return sendSuccess(res, `User ${updated.isActive ? 'activated' : 'deactivated'}`);
  } catch (error) {
    return sendError(res, 'Failed to toggle user status', error.message);
  }
};

const deleteAdminUser = async (req, res) => {
  try {
    const { reassignToId } = req.body;
    const userId = req.params.id;

    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      include: { _count: { select: { posts: { where: { isDeleted: false } } } } }
    });
    
    if (!user) return sendError(res, 'User not found', null, 404);

    if (user.role === 'ADMIN') {
      return sendError(res, 'Administrators cannot be deleted', null, 403);
    }

    const postCount = user._count.posts;

    if (postCount > 0 && !reassignToId) {
      return sendSuccess(res, 'User has stories. Reassignment required.', { hasStories: true, count: postCount });
    }

    await prisma.$transaction(async (tx) => {
      if (postCount > 0 && reassignToId) {
        await tx.post.updateMany({
          where: { authorId: userId, isDeleted: false },
          data: { authorId: reassignToId }
        });
      }

      await tx.user.update({
        where: { id: userId },
        data: { isDeleted: true, isActive: false }
      });
    });

    return sendSuccess(res, 'User moved to Trash successfully');
  } catch (error) {
    return sendError(res, 'Failed to delete user', error.message);
  }
};

const getDeletedUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { isDeleted: true },
        include: { profile: true },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where: { isDeleted: true } })
    ]);
    return sendSuccess(res, 'Deleted users fetched', {
      users,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch deleted users', error.message);
  }
};

const restoreUser = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isDeleted: false },
      include: { profile: true }
    });

    return sendSuccess(res, 'User restored');
  } catch (error) {
    return sendError(res, 'Failed to restore user', error.message);
  }
};

const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['USER', 'ADMIN'].includes(role)) {
      return sendError(res, 'Invalid role', null, 400);
    }
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return sendError(res, 'User not found', null, 404);

    if (user.role === 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return sendError(res, 'Administrator roles cannot be changed', null, 403);
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role }
    });
    return sendSuccess(res, 'User role updated', updated);
  } catch (error) {
    return sendError(res, 'Failed to change user role', error.message);
  }
};

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

const editUser = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      role, 
      isActive,
      fullName, 
      bio, 
      city, 
      tagline, 
      avatarUrl, 
      coverUrl, 
      facebookUrl, 
      instagramUrl, 
      twitterUrl, 
      youtubeUrl 
    } = req.body;

    const updateData = {};
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(password, salt);
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...updateData,
        profile: {
          upsert: {
            create: { 
              fullName, bio, city, tagline, avatarUrl, coverUrl, 
              facebookUrl, instagramUrl, twitterUrl, youtubeUrl 
            },
            update: { 
              fullName, bio, city, tagline, avatarUrl, coverUrl, 
              facebookUrl, instagramUrl, twitterUrl, youtubeUrl 
            }
          }
        }
      },
      include: { profile: true }
    });
    return sendSuccess(res, 'User updated successfully', user);
  } catch (error) {
    return sendError(res, 'Failed to update user', error.message);
  }
};

const getStats = async (req, res) => {
  try {
    const userCount = await prisma.user.count({ where: { isDeleted: false } });
    const postCount = await prisma.post.count({ where: { isDeleted: false, status: 'APPROVED' } });
    const pendingCount = await prisma.post.count({ where: { status: 'PENDING', isDeleted: false } });
    const likeCount = await prisma.like.count();
    const connectionCount = await prisma.connection.count();
    const commentCount = await prisma.comment.count();
    
    // Get category distribution
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    const categoryDistribution = categories.map(c => ({
      name: c.name,
      count: c._count.posts || 0
    }));

    // Get recent registrations
    const recentUsers = await prisma.user.findMany({
      where: { isDeleted: false },
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Get top 5 stories
    const topPosts = await prisma.post.findMany({
      where: { isDeleted: false, status: 'APPROVED' },
      include: {
        _count: {
          select: { likes: true, comments: true }
        }
      },
      orderBy: { viewCount: 'desc' },
      take: 5
    });

    return sendSuccess(res, 'Stats fetched', { 
      _v: Date.now(),
      userCount, 
      postCount, 
      pendingCount, 
      likeCount,
      connectionCount,
      commentCount,
      categoryDistribution,
      recentUsers: recentUsers.map(u => ({
        id: u.id,
        name: u.profile?.fullName || u.email,
        avatar: u.profile?.avatarUrl,
        email: u.email,
        createdAt: u.createdAt
      })),
      topPosts: topPosts.map(p => ({
        id: p.id,
        title: p.title,
        views: p.viewCount,
        likes: p._count.likes,
        comments: p._count.comments,
        points: (p.viewCount * 1) + (p._count.likes * 5) + (p._count.comments * 10)
      }))
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch stats', error.message);
  }
};

const getTopPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { isDeleted: false, status: 'APPROVED' },
      orderBy: { viewCount: 'desc' },
      take: 5
    });
    return sendSuccess(res, 'Top posts fetched', posts);
  } catch (error) {
    return sendError(res, 'Failed to fetch top posts', error.message);
  }
};

const getTopUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isDeleted: false },
      take: 5
    });
    return sendSuccess(res, 'Top users fetched', users);
  } catch (error) {
    return sendError(res, 'Failed to fetch top users', error.message);
  }
};

const getAdminProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true }
    });
    return sendSuccess(res, 'Admin profile fetched', user);
  } catch (error) {
    return sendError(res, 'Failed to fetch admin profile', error.message);
  }
};

const updateAdminProfile = async (req, res) => {
  try {
    console.log('Update Profile Payload:', req.body);
    const { 
      email, 
      password, 
      fullName, 
      avatarUrl,
      tagline,
      bio,
      city,
      coverUrl,
      facebookUrl,
      instagramUrl,
      twitterUrl,
      youtubeUrl
    } = req.body;
    
    // 1. Update User data (email, password)
    let userData = {};
    if (email) userData.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      userData.passwordHash = await bcrypt.hash(password, salt);
    }

    if (Object.keys(userData).length > 0) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: userData
      });
    }

    // 2. Upsert Profile data
    const profileData = {
      fullName: fullName || '',
      avatarUrl: avatarUrl || null,
      tagline: tagline || null,
      bio: bio || null,
      city: city || null,
      facebookUrl: facebookUrl || null,
      instagramUrl: instagramUrl || null,
      twitterUrl: twitterUrl || null,
      youtubeUrl: youtubeUrl || null,
      coverUrl: coverUrl || null
    };

    console.log('Processed Profile Data:', profileData);

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        profile: {
          upsert: {
            create: profileData,
            update: profileData
          }
        }
      },
      include: { profile: true }
    });

    console.log('Successfully updated profile for user:', req.user.id);
    return sendSuccess(res, 'Admin profile updated', updatedUser);
  } catch (error) {
    console.error('Update Admin Profile Error:', error);
    return sendError(res, 'Failed to update admin profile', error.message);
  }
};


module.exports = {
  getAdminPosts,
  approvePost,
  rejectPost,
  deleteAdminPost,
  getDeletedPosts,
  restorePost,
  getAdminUsers,
  getUserById,
  createAdminUser,
  toggleUserStatus,
  deleteAdminUser,
  getDeletedUsers,
  restoreUser,
  changeUserRole,
  editUser,
  getStats,
  getTopPosts,
  getTopUsers,
  getAdminProfile,
  updateAdminProfile
};
