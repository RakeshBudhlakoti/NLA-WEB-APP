const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function backfill() {
  const categories = await prisma.category.findMany();
  for (const cat of categories) {
    if (!cat.slug) {
      const slug = cat.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      await prisma.category.update({
        where: { id: cat.id },
        data: { slug }
      });
      console.log(`Updated ${cat.name} -> ${slug}`);
    }
  }
}

backfill().then(() => process.exit(0));
