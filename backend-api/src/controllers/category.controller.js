const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendSuccess, sendError } = require('../utils/response');

const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            posts: {
              where: { isDeleted: false }
            }
          }
        }
      }
    });
    return sendSuccess(res, 'Categories fetched', categories);
  } catch (error) {
    return sendError(res, 'Failed to fetch categories', error.message);
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, slug, image } = req.body;
    const category = await prisma.category.create({
      data: { 
        name,
        slug: slug || name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        image
      }
    });
    return sendSuccess(res, 'Category created', category, 201);
  } catch (error) {
    return sendError(res, 'Failed to create category', error.message);
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, image } = req.body;
    const category = await prisma.category.update({
      where: { id },
      data: { 
        name,
        slug: slug || name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        image
      }
    });
    return sendSuccess(res, 'Category updated', category);
  } catch (error) {
    return sendError(res, 'Failed to update category', error.message);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category has posts
    const postCount = await prisma.post.count({ where: { categoryId: id } });
    if (postCount > 0) {
      return sendError(res, 'Cannot delete category with associated stories', null, 400);
    }

    await prisma.category.delete({ where: { id } });
    return sendSuccess(res, 'Category deleted');
  } catch (error) {
    return sendError(res, 'Failed to delete category', error.message);
  }
};

const getTags = async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' }
    });
    return sendSuccess(res, 'Tags fetched', tags);
  } catch (error) {
    return sendError(res, 'Failed to fetch tags', error.message);
  }
};

module.exports = { 
  getCategories, 
  createCategory, 
  updateCategory,
  deleteCategory,
  getTags 
};
