const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting data migration...');

  // Update Users
  const userResult = await prisma.user.updateMany({
    where: { role: 'ATHLETE' },
    data: { role: 'USER' },
  });
  console.log(`Updated ${userResult.count} users from ATHLETE to USER.`);

  // Update Posts
  const postResult = await prisma.post.updateMany({
    where: { status: 'DRAFT' },
    data: { status: 'PENDING' },
  });
  console.log(`Updated ${postResult.count} posts from DRAFT to PENDING.`);

  console.log('Data migration complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
