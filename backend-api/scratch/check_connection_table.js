const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkConnections() {
  try {
    console.log('Checking Connection table...');
    
    // Try a raw query to see if the table exists
    const tableCheck = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name ILIKE 'connection'
    `;
    console.log('Table check result:', tableCheck);

    if (tableCheck.length === 0) {
      console.log('❌ Connection table does NOT exist in the database.');
      console.log('Run: npx prisma db push');
    } else {
      console.log('✅ Connection table EXISTS.');
      const count = await prisma.connection.count();
      console.log('Total connections:', count);
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkConnections();
