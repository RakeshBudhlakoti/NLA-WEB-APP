const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for 5 users and 10 stories...');

  // 1. Create Categories and Tags
  const categoryWrestling = await prisma.category.upsert({
    where: { name: 'Wrestling' }, update: {}, create: { name: 'Wrestling' },
  });
  const categoryTraining = await prisma.category.upsert({
    where: { name: 'Training' }, update: {}, create: { name: 'Training' },
  });
  
  const tagInspiration = await prisma.tag.upsert({
    where: { name: 'Inspiration' }, update: {}, create: { name: 'Inspiration' },
  });
  const tagGrind = await prisma.tag.upsert({
    where: { name: 'Grind' }, update: {}, create: { name: 'Grind' },
  });

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // 2. Create 5 Athletes
  const athletesData = [
    { email: 'jordan@nlasports.com', name: 'Jordan Burroughs', bio: 'Gold Medalist.' },
    { email: 'kyle@nlasports.com', name: 'Kyle Snyder', bio: 'Captain America.' },
    { email: 'spencer@nlasports.com', name: 'Spencer Lee', bio: 'Excuses are for wusses.' },
    { email: 'david@nlasports.com', name: 'David Taylor', bio: 'Magic Man.' },
    { email: 'gigi@nlasports.com', name: 'Gigi', bio: 'Rising Star.' }
  ];

  const createdAthletes = [];
  
  for (const a of athletesData) {
    const user = await prisma.user.upsert({
      where: { email: a.email },
      update: {},
      create: {
        email: a.email,
        passwordHash,
        role: 'ATHLETE',
        isVerified: true,
        profile: {
          create: {
            fullName: a.name,
            bio: a.bio,
            city: 'USA'
          }
        }
      }
    });
    createdAthletes.push(user);
  }

  // 3. Create 10 Stories (2 stories per athlete)
  const storiesData = [
    { title: 'The Comeback', content: 'Never count me out. The comeback is always greater than the setback.', cat: categoryWrestling.id, tag: tagInspiration.id },
    { title: 'Early Morning Grinds', content: 'Nobody sees the 4 AM workouts, but they see the results under the bright lights.', cat: categoryTraining.id, tag: tagGrind.id },
    { title: 'Staying Focused', content: 'Distractions are everywhere. Keep your eyes on the prize.', cat: categoryTraining.id, tag: tagInspiration.id },
    { title: 'My First Tournament', content: 'I remember stepping on the mat for the very first time. Terrified but excited.', cat: categoryWrestling.id, tag: tagInspiration.id },
    { title: 'Overcoming Injury', content: 'Tearing my ACL was the hardest thing ever. But I am back and stronger.', cat: categoryTraining.id, tag: tagGrind.id },
    { title: 'The Olympic Dream', content: 'Since I was 6 years old, all I wanted was Olympic Gold.', cat: categoryWrestling.id, tag: tagInspiration.id },
    { title: 'Nutrition Secrets', content: 'You are what you eat. Fuel the machine properly.', cat: categoryTraining.id, tag: tagGrind.id },
    { title: 'Mental Toughness', content: 'Wrestling is 90% mental. You have to break your opponent before you touch them.', cat: categoryWrestling.id, tag: tagGrind.id },
    { title: 'The Brotherhood', content: 'My team is my family. We bleed together.', cat: categoryWrestling.id, tag: tagInspiration.id },
    { title: 'Final Push', content: 'One more rep. One more sprint. That makes the difference.', cat: categoryTraining.id, tag: tagGrind.id },
  ];

  for (let i = 0; i < 10; i++) {
    // Assign 2 stories to each of the 5 athletes
    const athleteIndex = Math.floor(i / 2); 
    const athlete = createdAthletes[athleteIndex];
    const story = storiesData[i];

    await prisma.post.create({
      data: {
        title: story.title,
        content: story.content,
        type: 'story',
        status: 'APPROVED',
        authorId: athlete.id,
        categoryId: story.cat,
        tags: { connect: { id: story.tag } },
        viewCount: Math.floor(Math.random() * 500)
      }
    });
  }

  // 4. Create Default Settings
  const settings = [
    { key: 'siteName', value: 'NLA SPORTS' },
    { key: 'metaTitle', value: 'NLA Sports | Empowering Athletes Through Stories & Analytics' },
    { key: 'metaDescription', value: 'NLA Sports is the premier platform for athlete storytelling and performance tracking. Discover professional profiles, engagement metrics, and the journeys of elite athletes worldwide.' },
    { key: 'contactEmail', value: 'info@nlasports.com' },
    { key: 'allowEditAfterApproval', value: 'false' }
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s
    });
  }

  console.log('✅ Seeding completed successfully!');
  console.log(`👤 Created ${createdAthletes.length} Athletes`);
  console.log(`📝 Created 10 Stories (2 per athlete)`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
