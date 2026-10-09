import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function check() {
  const admin = await prisma.user.findUnique({ where: { employeeId: 'ADM-1001' } });
  console.log('Admin:', admin);
  await prisma.$disconnect();
}
check();