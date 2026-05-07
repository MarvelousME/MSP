import { PrismaClient, Gender, Role, UserStatus, ReferralStatus, ConversionStatus, CommissionStatus, PayoutStatus, TransactionStatus, EmailTemplateType, Ethnicity } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Cyber-Fintech database seeding...');

  // 1. Clear existing data
  console.log('🗑️ Clearing existing data for fresh installation...');
  await prisma.pointLog.deleteMany();
  await prisma.leaderboardEntry.deleteMany();
  await prisma.affiliateBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.commission.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.conversion.deleteMany();
  await prisma.referralClick.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.affiliate.deleteMany();
  await prisma.user.deleteMany();
  await prisma.program.deleteMany();
  await prisma.partnerGroup.deleteMany();
  await prisma.emailTemplate.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);
const ethnicities = [Ethnicity.WHITE, Ethnicity.BLACK, Ethnicity.ASIAN, Ethnicity.HISPANIC, Ethnicity.INDIAN, Ethnicity.MIDDLE_EASTERN, Ethnicity.OTHER];

  // 2. Create Default Program and Partner Groups
  console.log('🏢 Initializing Program Nodes...');
  const program = await prisma.program.create({
    data: {
      name: 'My Stable Prime Elite',
      slug: 'msp-elite',
      description: 'The premier Cyber-Fintech affiliate network.',
      commissionRate: 25.0,
      commissionType: 'PERCENTAGE',
      cookieDuration: 60,
      currency: 'USD',
      isActive: true,
      isDefault: true,
    },
  });

  const groups = [
    { name: 'Standard Operative', rate: 20.0, isDefault: true },
    { name: 'Elite Operative', rate: 30.0, isDefault: false },
    { name: 'Node Master', rate: 45.0, isDefault: false },
  ];

  const partnerGroups = [];
  for (const group of groups) {
    const pg = await prisma.partnerGroup.create({
      data: {
        name: group.name,
        description: `${group.name} production tier.`,
        commissionRate: group.rate,
        isDefault: group.isDefault,
      },
    });
    partnerGroups.push(pg);
  }

  // 3. Create Admin (The Architect)
  console.log('🔑 Initializing Command Admin...');
  const admin = await prisma.user.create({
      data: {
        email: 'marvin.saunders@gmail.com',
        name: 'The Architect',
        password: hashedPassword,
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
        gender: Gender.MALE,
        birthDate: new Date('1990-01-01'),
        ethnicity: faker.helpers.arrayElement(ethnicities),
        age: 36, // Based on 1990
        profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      },
  });

  // 4. Create Badges (Network Achievements)
  console.log('🏆 Minting Network Badges...');
  const badgeData = [
    { name: 'Genesis Node', desc: 'Joined during system initialization.', icon: 'Zap' },
    { name: 'High Yield', desc: 'Generated over 10,000 XP points.', icon: 'TrendingUp' },
    { name: 'Whale Hunter', desc: 'Secured a high-value institutional lead.', icon: 'Shield' },
    { name: 'Signal Master', desc: 'Maintained 50%+ conversion rate.', icon: 'Activity' },
  ];

  const badges = [];
  for (const b of badgeData) {
    const badge = await prisma.badge.create({
      data: {
        name: b.name,
        description: b.desc,
        icon: b.icon,
        requirement: { type: 'automated', value: 'production' },
      },
    });
    badges.push(badge);
  }

  // 5. Create Affiliates (The Network Operatives)
  console.log('🤝 Synchronizing 25 Global Operatives...');
  const affiliates = [];
  for (let i = 0; i < 19; i++) {
    const gender = faker.helpers.arrayElement([Gender.MALE, Gender.FEMALE]);
    const firstName = faker.person.firstName(gender === Gender.MALE ? 'male' : 'female');
    const lastName = faker.person.lastName();
    
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        name: `${firstName} ${lastName}`,
        password: hashedPassword,
        role: Role.AFFILIATE,
        status: UserStatus.ACTIVE,
        gender: gender,
        ethnicity: faker.helpers.arrayElement(ethnicities),
        age: faker.number.int({ min: 18, max: 75 }),
        birthDate: faker.date.birthdate({ min: 18, max: 75, mode: 'age' }),
        profilePicture: `https://i.pravatar.cc/150?u=${i}`,
      },
    });

    const affiliate = await prisma.affiliate.create({
      data: {
        userId: user.id,
        referralCode: `MSP-${faker.string.alphanumeric(6).toUpperCase()}`,
        partnerGroupId: faker.helpers.arrayElement(partnerGroups).id,
        balanceCents: faker.number.int({ min: 0, max: 1000000 }), // Up to $10,000 / R10,000
        points: faker.number.int({ min: 100, max: 15000 }),
        level: faker.number.int({ min: 1, max: 25 }),
      },
    });
    affiliates.push(affiliate);

    // Randomly assign 1-3 badges
    const numBadges = faker.number.int({ min: 1, max: 3 });
    const selectedBadges = faker.helpers.arrayElements(badges, numBadges);
    for (const b of selectedBadges) {
      await prisma.affiliateBadge.create({
        data: {
          affiliateId: affiliate.id,
          badgeId: b.id,
        },
      });
    }

    // Audit Log for initialization
    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        action: 'NODE_INITIALIZED',
        objectType: 'AFFILIATE',
        objectId: affiliate.id,
        payload: { node: affiliate.referralCode },
      },
    });
  }

  // 6. Create Referrals (Conversion Streams)
  console.log('👤 Initializing 150+ Signal Streams (Customers)...');
  for (const affiliate of affiliates) {
    const referralCount = faker.number.int({ min: 5, max: 15 });
    for (let j = 0; j < referralCount; j++) {
      const gender = faker.helpers.arrayElement(['male', 'female'] as const);
      const firstName = faker.person.firstName(gender);
      const lastName = faker.person.lastName();
      const currency = faker.helpers.arrayElement(['USD', 'ZAR']);
      
      const referral = await prisma.referral.create({
        data: {
          affiliateId: affiliate.id,
          leadName: `${firstName} ${lastName}`,
          leadEmail: faker.internet.email({ firstName, lastName }).toLowerCase(),
          leadPhone: faker.phone.number(),
          status: faker.helpers.arrayElement([
            ReferralStatus.APPROVED, 
            ReferralStatus.APPROVED, 
            ReferralStatus.APPROVED, 
            ReferralStatus.PENDING, 
            ReferralStatus.REJECTED
          ]),
          createdAt: faker.date.past({ years: 1 }),
        },
      });

      // Create click logs for the signal
      const clickCount = faker.number.int({ min: 1, max: 20 });
      for (let k = 0; k < clickCount; k++) {
        await prisma.referralClick.create({
          data: {
            referralId: referral.id,
            ipAddress: faker.internet.ip(),
            userAgent: faker.internet.userAgent(),
            createdAt: faker.date.between({ from: referral.createdAt, to: new Date() }),
          },
        });
      }

      if (referral.status === ReferralStatus.APPROVED) {
        // Multi-Currency Conversion
        // Random amount between 500 and 50000 (cents/cents equivalent)
        const amountCents = faker.number.int({ min: 5000, max: 250000 });
        
        const conversion = await prisma.conversion.create({
          data: {
            affiliateId: affiliate.id,
            referralId: referral.id,
            eventType: faker.helpers.arrayElement(['PURCHASE', 'PURCHASE', 'SIGNUP']),
            amountCents,
            currency,
            status: ConversionStatus.APPROVED,
            createdAt: faker.date.between({ from: referral.createdAt, to: new Date() }),
          },
        });

        // Calculate Commission based on the operative's group
        const pg = await prisma.partnerGroup.findUnique({
          where: { id: affiliate.partnerGroupId! },
        });
        const rate = (pg?.commissionRate || 20) / 100;
        const commissionAmountCents = Math.round(amountCents * rate);
        
        await prisma.commission.create({
          data: {
            conversionId: conversion.id,
            affiliateId: affiliate.id,
            userId: affiliate.userId,
            amountCents: commissionAmountCents,
            rate: rate,
            status: CommissionStatus.APPROVED,
            createdAt: conversion.createdAt,
          },
        });

        // Transaction record
        await prisma.transaction.create({
          data: {
            referralId: referral.id,
            affiliateId: affiliate.id,
            customerName: referral.leadName,
            customerEmail: referral.leadEmail,
            amountCents: amountCents,
            commissionCents: commissionAmountCents,
            commissionRate: rate,
            status: TransactionStatus.COMPLETED,
            paidAt: conversion.createdAt,
            createdBy: admin.id,
          },
        });

        // XP Generation
        await prisma.pointLog.create({
          data: {
            affiliateId: affiliate.id,
            points: Math.round(amountCents / (currency === 'USD' ? 100 : 1800)), // USD gets more points relative to ZAR
            reason: 'CONVERSION_YIELD',
            metadata: { conversionId: conversion.id, currency },
          },
        });
      }
    }
  }

  // 7. Calculate Final Ranking
  console.log('📊 Synchronizing Leaderboard Rankings...');
  const sortedAffiliates = await prisma.affiliate.findMany({
    orderBy: { points: 'desc' },
  });

  for (let i = 0; i < sortedAffiliates.length; i++) {
    await prisma.leaderboardEntry.create({
      data: {
        affiliateId: sortedAffiliates[i].id,
        points: sortedAffiliates[i].points,
        rank: i + 1,
      },
    });
  }

  // 8. Create Technical Email Templates
  console.log('📧 Configured System Communications...');
  const templates = [
    { type: EmailTemplateType.WELCOME_EMAIL, name: 'Genesis Welcome', subject: '[MSP] Node Initialized: Welcome to the Network', body: 'Greetings {{name}}, your operative status is now ACTIVE. Access the control center to begin signal synchronization.' },
    { type: EmailTemplateType.NEW_REFERRAL, name: 'Signal Alert', subject: '[MSP] New Signal Detected', body: 'Alert: {{leadName}} has synchronized via your node. Monitor the conversion stream for yield verification.' },
    { type: EmailTemplateType.PARTNER_PAID, name: 'Yield Transferred', subject: '[MSP] Asset Distribution Successful', body: 'Distribution of {{amount}} has been successfully executed to your designated account.' },
  ];

  for (const t of templates) {
    await prisma.emailTemplate.create({
      data: t,
    });
  }

  console.log('✅ Cyber-Fintech Ecosystem initialized successfully.');
  console.log('Admin Access: marvin.saunders@gmail.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Database Initialization Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
