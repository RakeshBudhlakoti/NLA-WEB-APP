const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    where: { email: 'rakeshbudhlakoti1991@gmail.com' }
  });

  for (const user of users) {
    const posts = await prisma.post.findMany({
      where: { authorId: user.id },
      select: { id: true, isDeleted: true, status: true }
    });
    console.log(`User: ${user.email}`);
    console.log(`Posts:`, posts);
    
    const countWithIsDeletedFalse = await prisma.post.count({
      where: { authorId: user.id, isDeleted: false }
    });
    console.log(`Count (isDeleted: false): ${countWithIsDeletedFalse}`);
  }
}

check().then(() => prisma.$disconnect());
