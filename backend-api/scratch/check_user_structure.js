const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    where: { email: 'rakeshbudhlakoti1991@gmail.com' },
    include: { 
      profile: true,
      _count: {
        select: { posts: true }
      }
    }
  });
  
  console.log('User Structure:', JSON.stringify(users[0], null, 2));
  process.exit(0);
}

check();
