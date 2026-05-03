const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const posts = await prisma.post.findMany({
    where: { status: 'APPROVED', isDeleted: false },
    select: {
      id: true,
      authorId: true,
      author: {
        select: {
          id: true,
          email: true,
          isDeleted: true,
          isActive: true
        }
      }
    }
  });
  console.log('Approved posts and their authors:');
  posts.forEach(p => {
    console.log(`Post: ${p.id} | Author: ${p.author.email} | Active: ${p.author.isActive} | Deleted: ${p.author.isDeleted}`);
  });
}

check();
