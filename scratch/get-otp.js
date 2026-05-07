const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getLatestOTP(email) {
  const otp = await prisma.oTP.findFirst({
    where: { email: email.toLowerCase() },
    orderBy: { createdAt: 'desc' }
  });
  
  if (otp) {
    console.log(`Latest OTP for ${email}: ${otp.code} (Created at: ${otp.createdAt})`);
  } else {
    console.log(`No OTP found for ${email}`);
  }
}

const email = process.argv[2] || 'marvin.saunders@gmail.com';
getLatestOTP(email)
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
