const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('P@ssword123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'marvin.saunders@gmail.com' },
    update: {
      role: 'ADMIN',
      status: 'ACTIVE'
    },
    create: {
      email: 'marvin.saunders@gmail.com',
      name: 'Marvin Saunders',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log('User created or updated:', user.email);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
