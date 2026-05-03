const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    where: { isDeleted: false, isActive: true },
    select: { id: true, email: true, role: true }
  });
  console.log('Total Active Users:', users.length);
  console.log('Users:', users);
}

check();
