const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { posts: { where: { isDeleted: false, status: 'APPROVED' } } }
      }
    }
  });
  console.log('Category Distribution:', JSON.stringify(categories, null, 2));
  
  const postsWithNoCategory = await prisma.post.count({
    where: { categoryId: null, isDeleted: false, status: 'APPROVED' }
  });
  console.log('Approved posts with NO category:', postsWithNoCategory);
  
  process.exit(0);
}

check();
