const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const posts = await prisma.post.findMany({ where: { isDeleted: false } });
  console.log('Total non-deleted posts:', posts.length);
  
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: { posts: true }
      }
    }
  });
  
  users.forEach(u => {
    console.log(`User ${u.email}: ${u._count.posts} posts`);
  });
  
  process.exit(0);
}

check();
