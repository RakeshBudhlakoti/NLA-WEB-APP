const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const posts = await prisma.post.findMany({
    where: { status: 'APPROVED', isDeleted: false },
    select: {
      id: true,
      title: true,
      viewCount: true,
      _count: { select: { likes: true } }
    }
  });
  console.log('Total Approved Posts:', posts.length);
  console.log('Post details:', posts);
  
  const totalViews = posts.reduce((s, p) => s + p.viewCount, 0);
  console.log('Summed Views:', totalViews);
}

check();
