const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { author: true }
  });
  
  console.log('--- LATEST POSTS ---');
  posts.forEach(p => {
    console.log(`Title: ${p.title} | Status: ${p.status} | Author: ${p.author.email} | Role: ${p.author.role}`);
  });
}

check().then(() => process.exit(0));
