const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for NLA Sports (Production Ready)...');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // 1. Create Default Admin
  console.log('👤 Creating Admin account...');
  await prisma.user.upsert({
    where: { email: 'rbkstaging@gmail.com' },
    update: {},
    create: {
      email: 'rbkstaging@gmail.com',
      passwordHash: passwordHash,
      role: 'ADMIN',
      isVerified: true,
      profile: {
        create: {
          fullName: 'NLA Administrator',
          bio: 'System Administrator'
        }
      }
    }
  });

  // 2. Create Categories
  console.log('📂 Creating categories...');
  const categoriesData = [
    { name: 'Wrestling' },
    { name: 'Training' },
    { name: 'Nutrition' },
    { name: 'Mindset' },
    { name: 'Technique' }
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const c = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: {
        name: cat.name,
        slug: cat.name.toLowerCase().replace(/ /g, '-')
      },
    });
    categories.push(c);
  }

  // 3. Create Tags
  const tagsData = ['Inspiration', 'Grind', 'Recovery', 'Olympic', 'Youth'];
  const tags = [];
  for (const tag of tagsData) {
    const t = await prisma.tag.upsert({
      where: { name: tag },
      update: {},
      create: { name: tag },
    });
    tags.push(t);
  }

  // 4. Create Athletes
  console.log('🏃 Creating athletes...');
  const athletesData = [
    { email: 'jordan@nlasports.com', name: 'Jordan Burroughs', bio: 'Olympic Gold Medalist. 6x World Champion.', avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop' },
    { email: 'kyle@nlasports.com', name: 'Kyle Snyder', bio: 'Youngest Olympic Wrestling Champion in US history.', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop' },
    { email: 'spencer@nlasports.com', name: 'Spencer Lee', bio: '3x NCAA Champion. The most dominant force on the mat.', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop' },
    { email: 'david@nlasports.com', name: 'David Taylor', bio: 'The Magic Man. Olympic Gold Medalist.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
    { email: 'gigi@nlasports.com', name: 'Gigi', bio: 'Rising star in international freestyle wrestling.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' }
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
            avatarUrl: a.avatar,
            city: 'USA'
          }
        }
      }
    });
    createdAthletes.push(user);
  }

  // 5. Create Stories with Engagement Data
  console.log('📝 Creating stories and engagement...');
  const storiesData = [
    { title: 'The Comeback', content: 'Never count me out. The comeback is always greater than the setback.', catIdx: 0 },
    { title: 'Early Morning Grinds', content: 'Nobody sees the 4 AM workouts, but they see the results under the bright lights.', catIdx: 1 },
    { title: 'Staying Focused', content: 'Distractions are everywhere. Keep your eyes on the prize.', catIdx: 3 },
    { title: 'My First Tournament', content: 'I remember stepping on the mat for the very first time. Terrified but excited.', catIdx: 0 },
    { title: 'Overcoming Injury', content: 'Tearing my ACL was the hardest thing ever. But I am back and stronger.', catIdx: 1 },
    { title: 'The Olympic Dream', content: 'Since I was 6 years old, all I wanted was Olympic Gold.', catIdx: 0 },
    { title: 'Nutrition Secrets', content: 'You are what you eat. Fuel the machine properly.', catIdx: 2 },
    { title: 'Mental Toughness', content: 'Wrestling is 90% mental. You have to break your opponent.', catIdx: 3 },
    { title: 'The Brotherhood', content: 'My team is my family. We bleed together.', catIdx: 4 },
    { title: 'Final Push', content: 'One more rep. One more sprint. That makes the difference.', catIdx: 1 },
  ];

  for (let i = 0; i < storiesData.length; i++) {
    const athlete = createdAthletes[i % 5];
    const story = storiesData[i];

    const post = await prisma.post.create({
      data: {
        title: story.title,
        content: story.content,
        type: 'story',
        status: 'APPROVED',
        authorId: athlete.id,
        categoryId: categories[story.catIdx].id,
        tags: { connect: { id: tags[i % tags.length].id } },
        viewCount: Math.floor(Math.random() * 1500) + 200,
        createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000))
      }
    });

    const numLikes = Math.floor(Math.random() * 50) + 10;
    for (let j = 0; j < numLikes; j++) {
      const liker = createdAthletes[Math.floor(Math.random() * 5)];
      await prisma.like.create({
        data: {
          userId: liker.id,
          postId: post.id
        }
      }).catch(() => { });
    }

    const numComments = Math.floor(Math.random() * 5) + 1;
    for (let j = 0; j < numComments; j++) {
      const commenter = createdAthletes[Math.floor(Math.random() * 5)];
      await prisma.comment.create({
        data: {
          content: `Great story! ${athlete.email.split('@')[0]} is an inspiration.`,
          userId: commenter.id,
          postId: post.id
        }
      });
    }
  }

  // 6. Default Settings
  console.log('⚙️ Setting up platform defaults...');
  const settings = [
    { key: 'siteName', value: 'NLA SPORTS' },
    { key: 'metaTitle', value: 'NLA Sports | Empowering Athletes Through Stories' },
    { key: 'contactEmail', value: 'rbkstaging@gmail.com' }
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s
    });
  }

  console.log('\n✅ SEEDING COMPLETE!');
  console.log('---------------------------------');
  console.log('🔑 Admin Email: rbkstaging@gmail.com');
  console.log('🔑 Password: password123');
  console.log('---------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
