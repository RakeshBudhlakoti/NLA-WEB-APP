const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendSuccess, sendError } = require('../utils/response');
const emailService = require('../utils/email.service');

const createPost = async (req, res) => {
  try {
    const { title, description, content, challenge, motivation, achievement, editorialHighlights, mediaUrl, type, categoryId, isExclusive, isAdminPick } = req.body;
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';
    const status = isAdmin ? 'APPROVED' : 'PENDING';
    console.log(`📝 Creating story: role=${req.user.role}, isAdmin=${isAdmin}, status=${status}`);
    
    const post = await prisma.post.create({
      data: {
        title,
        description,
        content,
        challenge,
        motivation,
        achievement,
        editorialHighlights,
        mediaUrl,
        type,
        categoryId,
        authorId: req.user.id,
        status,
        isExclusive: isExclusive === true || isExclusive === 'true',
        isAdminPick: isAdminPick === true || isAdminPick === 'true'
      }
    });

    // Notify Admins only if PENDING
    if (status === 'PENDING') {
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, include: { profile: true } });
      if (admins.length > 0) {
        const author = await prisma.user.findUnique({ where: { id: req.user.id }, include: { profile: true } });
        await prisma.notification.createMany({
          data: admins.map(admin => ({
            userId: admin.id,
            title: 'New Content Pending Approval',
            message: `New content "${post.title}" has been submitted for review.`,
            type: 'STORY_SUBMITTED',
            data: { authorName: author?.profile?.fullName || author?.email || 'An athlete', postId: post.id },
            link: `/stories/${post.id}`
          }))
        });
        // Send email to each admin
        for (const admin of admins) {
          const adminName = admin.profile?.fullName || admin.email;
          emailService.sendStorySubmittedEmail(
            admin.email, adminName,
            author?.profile?.fullName || author?.email || 'An athlete',
            author?.email || '',
            post.title
          );
        }
      }
    }

    return sendSuccess(res, 'Post submitted for review', post, 201);
  } catch (error) {
    return sendError(res, 'Failed to create post', error.message);
  }
};

const getPosts = async (req, res) => {
  try {
    const { type, category, page = 1, limit = 10, isExclusive } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { isDeleted: false, status: 'APPROVED' };
    if (type) where.type = type;
    if (isExclusive !== undefined) where.isExclusive = isExclusive === 'true';
    if (req.query.isAdminPick !== undefined) where.isAdminPick = req.query.isAdminPick === 'true';
    
    if (category) {
      const cat = await prisma.category.findUnique({ where: { name: category } });
      if (cat) where.categoryId = cat.id;
    }

    const posts = await prisma.post.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: { 
        author: { select: { id: true, profile: true } },
        category: true,
        _count: { select: { likes: true, comments: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return sendSuccess(res, 'Posts fetched', posts);
  } catch (error) {
    return sendError(res, 'Failed to fetch posts', error.message);
  }
};

const getMyPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { authorId: req.user.id, isDeleted: false },
        include: { 
          author: { select: { id: true, profile: true } },
          category: true,
          _count: { select: { likes: true, comments: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.post.count({ where: { authorId: req.user.id, isDeleted: false } })
    ]);
    return sendSuccess(res, 'My posts fetched', {
      posts,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch posts', error.message);
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: { 
        author: { select: { id: true, profile: true } }, 
        category: true, 
        tags: true,
        _count: { select: { likes: true, comments: true } },
        comments: {
          where: { isDeleted: false },
          include: { 
            user: { 
              select: { 
                email: true, 
                profile: { select: { fullName: true, avatarUrl: true } } 
              } 
            } 
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    if (!post || post.isDeleted) return sendError(res, 'Post not found', null, 404);
    
    return sendSuccess(res, 'Post fetched', post);
  } catch (error) {
    return sendError(res, 'Failed to fetch post', error.message);
  }
};

const updatePost = async (req, res) => {
  try {
    const { title, description, content, challenge, motivation, achievement, editorialHighlights, mediaUrl, categoryId, isExclusive, isAdminPick, type } = req.body;
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    
    if (!post) return sendError(res, 'Post not found', null, 404);
    if (post.authorId !== req.user.id && req.user.role !== 'ADMIN') return sendError(res, 'Unauthorized', null, 403);

    // Check if editing is allowed for approved stories
    if (post.status === 'APPROVED' && req.user.role !== 'ADMIN') {
      const settings = await prisma.setting.findMany();
      const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
      if (settingsMap['allowEditAfterApproval'] === 'false') {
        return sendError(res, 'Editing is disabled for approved stories. Please contact an administrator.', null, 403);
      }
    }

    const dataToUpdate = { title, description, content, challenge, motivation, achievement, editorialHighlights, mediaUrl, categoryId, type };
    
    if (isExclusive !== undefined) {
      dataToUpdate.isExclusive = isExclusive === true || isExclusive === 'true';
    }

    if (isAdminPick !== undefined) {
      dataToUpdate.isAdminPick = isAdminPick === true || isAdminPick === 'true';
    }

    // If a rejected post is edited, move back to PENDING
    if (post.status === 'REJECTED' && req.user.role !== 'ADMIN') {
      dataToUpdate.status = 'PENDING';
      dataToUpdate.rejectReason = null;
    }

    const updated = await prisma.post.update({
      where: { id: req.params.id },
      data: dataToUpdate
    });

    console.log('✅ Post updated successfully:', { id: updated.id, isAdminPick: updated.isAdminPick });

    if (dataToUpdate.status === 'PENDING') {
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map(admin => ({
            userId: admin.id,
            title: 'Story Re-submitted',
            message: `The story "${updated.title}" has been updated and is back for review.`,
            link: '/stories'
          }))
        });
      }
    }

    return sendSuccess(res, 'Post updated', updated);
  } catch (error) {
    return sendError(res, 'Failed to update post', error.message);
  }
};

const submitPost = async (req, res) => {
  try {
    const post = await prisma.post.findUnique({ 
      where: { id: req.params.id },
      include: { author: { include: { profile: true } } }
    });
    
    if (!post) return sendError(res, 'Post not found', null, 404);
    if (post.authorId !== req.user.id) return sendError(res, 'Unauthorized', null, 403);

    const updated = await prisma.post.update({
      where: { id: req.params.id },
      data: { status: 'PENDING' }
    });

    // Notify Admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          title: 'New Story Pending Approval',
          message: `A new story "${updated.title}" has been submitted for review.`,
          type: 'STORY_SUBMITTED',
          data: { authorName: post.author.profile?.fullName || post.author.email || 'An athlete', postId: updated.id },
          link: `/stories/${updated.id}`
        }))
      });
    }

    return sendSuccess(res, 'Post submitted for review', updated);
  } catch (error) {
    return sendError(res, 'Failed to submit post', error.message);
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    
    if (!post) return sendError(res, 'Post not found', null, 404);
    if (post.authorId !== req.user.id && req.user.role !== 'ADMIN') return sendError(res, 'Unauthorized', null, 403);

    await prisma.post.update({
      where: { id: req.params.id },
      data: { isDeleted: true }
    });

    return sendSuccess(res, 'Post deleted');
  } catch (error) {
    return sendError(res, 'Failed to delete post', error.message);
  }
};

// POST /posts/:id/view — atomically increment viewCount
const incrementView = async (req, res) => {
  try {
    await prisma.post.update({
      where: { id: req.params.id },
      data: { viewCount: { increment: 1 } }
    });
    return sendSuccess(res, 'View counted', null);
  } catch {
    return sendSuccess(res, 'View counted', null);
  }
};

module.exports = {
  createPost,
  getPosts,
  getMyPosts,
  getPostById,
  updatePost,
  submitPost,
  deletePost,
  incrementView
};
