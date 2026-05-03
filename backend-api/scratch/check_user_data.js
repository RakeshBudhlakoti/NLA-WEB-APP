const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: { posts: true }
      }
    }
  });

  for (const user of users) {
    const posts = await prisma.post.findMany({
      where: { authorId: user.id },
      include: {
        _count: {
          select: { likes: true }
        }
      }
    });
    const totalLikes = posts.reduce((acc, p) => acc + p._count.likes, 0);
    console.log(`User: ${user.email}, ID: ${user.id}, Posts: ${posts.length}, Likes: ${totalLikes}`);
  }
}

check().then(() => prisma.$disconnect());
